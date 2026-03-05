import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { accommodation, registrations, workshops } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";
import {
	getAccommodationPricing,
	parseCurrencyValue,
	parseWorkshopPrice,
} from "@/server/admin/pr/utils";
import { getConstantValue } from "@/server/constants";
import { hasEventPass } from "@/server/razorpay";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const FetchStayByUserIdInputSchema = z.object({
	userId: z.string().min(1),
});

export const fetchStayByUserId = createServerFn({ method: "GET" })
	.inputValidator(FetchStayByUserIdInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });
		const [stay] = await db
			.select()
			.from(accommodation)
			.where(eq(accommodation.userId, data.userId))
			.limit(1);

		if (!stay) {
			return null;
		}

		const elapsedDays = stay.checkedInAt
			? Math.max(
					0,
					Math.floor((Date.now() - stay.checkedInAt.getTime()) / ONE_DAY_IN_MS),
				)
			: 0;

		const overstayed =
			Boolean(stay.checkedInAt) &&
			!stay.checkedOutAt &&
			stay.accommodationRequired
				? elapsedDays > stay.nightsRequested
				: false;

		return {
			stay,
			elapsedDays,
			overstayed,
		};
	});

const GetStayStatusInputSchema = z.object({
	userId: z.string().min(1),
});

export const getStayStatus = createServerFn({ method: "GET" })
	.inputValidator(GetStayStatusInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		const result = await fetchStayByUserId({ data: { userId: data.userId } });
		const stay = result?.stay;

		return {
			exists: !!stay,
			accommodationRequired: stay?.accommodationRequired ?? false,
			nightsRequested: stay?.nightsRequested ?? 0,
			accommodationFee: stay?.accommodationFee ?? 0,
			cautionDeposit: stay?.cautionDeposit ?? 0,
			hostelName: stay?.hostelName ?? null,
			floor: stay?.floor ?? null,
			paymentVerified: stay?.paymentVerified ?? false,
			fineAmount: stay?.fineAmount ?? 0,
			finePaid: stay?.finePaid ?? false,
			cautionReturned: stay?.cautionReturned ?? false,
			checkedInAt: stay?.checkedInAt ?? null,
			checkedOutAt: stay?.checkedOutAt ?? null,
			updatedAt: stay?.updatedAt ?? null,
			elapsedDays: result?.elapsedDays ?? 0,
			overstayed: result?.overstayed ?? false,
		};
	});

const CalculateAccommodationTotalInputSchema = z.object({
	nightsRequested: z.number().int().positive(),
});

const parseRoomPrice = (value: string | null) => {
	if (value === null) {
		throw new Error("Missing constant value for key: room");
	}

	const parsedValue = Number(value);
	if (Number.isNaN(parsedValue) || parsedValue <= 0) {
		throw new Error("Invalid numeric constant value for key: room");
	}

	return parsedValue;
};

export const calculateAccommodationTotal = createServerFn({ method: "POST" })
	.inputValidator(CalculateAccommodationTotalInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		const roomValue = await getConstantValue("room");
		const roomPrice = parseRoomPrice(roomValue);
		const parsedRoomPrice = roomPrice;
		const total = parsedRoomPrice * data.nightsRequested;

		return {
			roomPrice: parsedRoomPrice,
			total,
		};
	});

const CheckInPricingPreviewInputSchema = z.object({
	accommodationRequired: z.boolean(),
	nightsRequested: z.number().int().min(0),
});

export const getCheckInPricingPreview = createServerFn({ method: "POST" })
	.inputValidator(CheckInPricingPreviewInputSchema)
	.handler(async () => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });
		const { roomPrice, depositAmount } = await getAccommodationPricing();

		return {
			roomPrice,
			depositAmount,
		};
	});

const OnspotSelectionInputSchema = z
	.object({
		selectedWorkshops: z.array(z.number().int().positive()).default([]),
		eventPassSelected: z.boolean().default(false),
	})
	.superRefine((data, ctx) => {
		if (data.selectedWorkshops.length > 0 && data.eventPassSelected) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Event pass cannot be selected when workshops are selected",
				path: ["eventPassSelected"],
			});
		}

		if (data.selectedWorkshops.length === 0 && !data.eventPassSelected) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Select at least one workshop or event pass",
				path: ["selectedWorkshops", "eventPassSelected"],
			});
		}
	});

const GetOnspotRegistrationOptionsInputSchema = z.object({
	userId: z.string().min(1),
});

export const getOnspotRegistrationOptions = createServerFn({ method: "GET" })
	.inputValidator(GetOnspotRegistrationOptionsInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		const [
			workshopRows,
			eventPassValue,
			existingWorkshopRegistrationRows,
			userHasEventPass,
		] = await Promise.all([
			db
				.select({
					id: workshops.id,
					title: workshops.title,
					price: workshops.price,
				})
				.from(workshops),
			getConstantValue("event_pass"),
			db
				.select({ workshopId: registrations.workshopId })
				.from(registrations)
				.where(
					and(
						eq(registrations.userId, data.userId),
						isNotNull(registrations.workshopId),
					),
				),
			hasEventPass(data.userId),
		]);

		const existingWorkshopRegistrations = Array.from(
			new Set(
				existingWorkshopRegistrationRows
					.map((registrationEntry) => registrationEntry.workshopId)
					.filter((workshopId): workshopId is number => workshopId !== null),
			),
		).sort((leftValue, rightValue) => leftValue - rightValue);

		return {
			workshops: workshopRows.map((workshopEntry) => ({
				id: workshopEntry.id,
				title: workshopEntry.title,
				price: parseWorkshopPrice(workshopEntry.id, workshopEntry.price),
			})),
			eventPassPrice: parseCurrencyValue("event_pass", eventPassValue),
			existingWorkshopRegistrations,
			hasEventPass: userHasEventPass,
		};
	});

export const calculateOnspotAmount = createServerFn({ method: "POST" })
	.inputValidator(OnspotSelectionInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		const selectedWorkshopIds = Array.from(new Set(data.selectedWorkshops));

		if (selectedWorkshopIds.length > 0) {
			const workshopRows = await db
				.select({
					id: workshops.id,
					price: workshops.price,
				})
				.from(workshops)
				.where(inArray(workshops.id, selectedWorkshopIds));

			if (workshopRows.length !== selectedWorkshopIds.length) {
				throw new Error("One or more selected workshops were not found");
			}

			const workshopPrices = workshopRows.reduce<Record<number, number>>(
				(accumulator, workshopEntry) => {
					accumulator[workshopEntry.id] = parseWorkshopPrice(
						workshopEntry.id,
						workshopEntry.price,
					);
					return accumulator;
				},
				{},
			);

			const totalAmount = selectedWorkshopIds.reduce(
				(total, workshopId) => total + (workshopPrices[workshopId] ?? 0),
				0,
			);

			return { totalAmount };
		}

		const eventPassValue = await getConstantValue("event_pass");
		const eventPassPrice = parseCurrencyValue("event_pass", eventPassValue);

		return { totalAmount: eventPassPrice };
	});
