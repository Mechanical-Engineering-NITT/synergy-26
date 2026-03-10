import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import {
	accommodation,
	customUser,
	events,
	onspotPayments,
	registrations,
	workshops,
} from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";
import {
	getAccommodationPricing,
	parseCurrencyValue,
	parseOnspotPrice,
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
		selectedEventIds: z.array(z.number().int().positive()).default([]),
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

		if (
			data.selectedWorkshops.length === 0 &&
			!data.eventPassSelected &&
			data.selectedEventIds.length === 0
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Select at least one workshop, event, or event pass",
				path: ["selectedWorkshops", "selectedEventIds", "eventPassSelected"],
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
			eventRows,
			eventPassValue,
			existingWorkshopRegistrationRows,
			existingEventRegistrationRows,
			userHasEventPass,
		] = await Promise.all([
			db
				.select({
					id: workshops.id,
					title: workshops.title,
					price: workshops.price,
					isDisabled: workshops.isDisabled,
				})
				.from(workshops),
			db
				.select({
					id: events.id,
					title: events.title,
					isDisabled: events.isDisabled,
				})
				.from(events),
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
			db
				.select({ eventId: registrations.eventId })
				.from(registrations)
				.where(
					and(
						eq(registrations.userId, data.userId),
						isNotNull(registrations.eventId),
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

		const existingEventRegistrations = Array.from(
			new Set(
				existingEventRegistrationRows
					.map((registrationEntry) => registrationEntry.eventId)
					.filter((eventId): eventId is number => eventId !== null),
			),
		).sort((leftValue, rightValue) => leftValue - rightValue);

		return {
			workshops: workshopRows.map((workshopEntry) => ({
				id: workshopEntry.id,
				title: workshopEntry.title,
				price: parseOnspotPrice(
					parseWorkshopPrice(workshopEntry.id, workshopEntry.price),
				),
				isDisabled: workshopEntry.isDisabled,
			})),
			events: eventRows.map((eventEntry) => ({
				id: eventEntry.id,
				title: eventEntry.title,
				isDisabled: eventEntry.isDisabled,
			})),
			eventPassPrice: parseOnspotPrice(
				parseCurrencyValue("event_pass", eventPassValue),
			),
			existingWorkshopRegistrations,
			existingEventRegistrations,
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
					accumulator[workshopEntry.id] = parseOnspotPrice(
						parseWorkshopPrice(workshopEntry.id, workshopEntry.price),
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

		if (!data.eventPassSelected) {
			return { totalAmount: 0 };
		}

		const eventPassValue = await getConstantValue("event_pass");
		const eventPassPrice = parseOnspotPrice(
			parseCurrencyValue("event_pass", eventPassValue),
		);

		return { totalAmount: eventPassPrice };
	});

const GetSwapWorkshopOptionsInputSchema = z.object({
	userId: z.string().min(1),
});

export const getSwapWorkshopOptions = createServerFn({ method: "GET" })
	.inputValidator(GetSwapWorkshopOptionsInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		const [workshopRows, existingWorkshopRegistrationRows] = await Promise.all([
			db
				.select({
					id: workshops.id,
					title: workshops.title,
					price: workshops.price,
				})
				.from(workshops),
			db
				.select({ workshopId: registrations.workshopId })
				.from(registrations)
				.where(
					and(
						eq(registrations.userId, data.userId),
						isNotNull(registrations.workshopId),
					),
				),
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
				price: parseOnspotPrice(
					parseWorkshopPrice(workshopEntry.id, workshopEntry.price),
				),
			})),
			existingWorkshopRegistrations,
		};
	});

export interface GajanaTransaction {
	id: string | number;
	userId: string;
	synergyId: string | null;
	fullname: string | null;
	phone: string | null;
	amount: number;
	type: string;
	createdAt: Date | string | null;
}

export const getGajanaData = createServerFn({ method: "GET" }).handler(
	async () => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		try {
			// Query 1: Accommodation Fees
			const accommRows = await db
				.select({
					id: accommodation.id,
					userId: accommodation.userId,
					synergyId: customUser.synergyId,
					fullname: customUser.fullname,
					phone: customUser.phone,
					amount: accommodation.accommodationFee,
					type: sql<string>`'ACCOMMODATION_FEE'`,
					createdAt: accommodation.createdAt,
				})
				.from(accommodation)
				.leftJoin(customUser, eq(customUser.userId, accommodation.userId))
				.where(
					sql`${accommodation.accommodationRequired} = true AND ${accommodation.accommodationFee} > 0`,
				);

			// Query 2: Caution Deposit (Initial Payment)
			const depositRows = await db
				.select({
					id: accommodation.id,
					userId: accommodation.userId,
					synergyId: customUser.synergyId,
					fullname: customUser.fullname,
					phone: customUser.phone,
					amount: accommodation.cautionDeposit,
					type: sql<string>`'CAUTION_DEPOSIT'`,
					createdAt: accommodation.checkedInAt,
				})
				.from(accommodation)
				.leftJoin(customUser, eq(customUser.userId, accommodation.userId))
				.where(
					sql`${accommodation.accommodationRequired} = true AND ${accommodation.cautionDeposit} > 0`,
				);

			// Query 2.1: Caution Deposit (Returned)
			const returnedDepositRows = await db
				.select({
					id: accommodation.id,
					userId: accommodation.userId,
					synergyId: customUser.synergyId,
					fullname: customUser.fullname,
					phone: customUser.phone,
					amount: sql<number>`-${accommodation.cautionDeposit}`,
					type: sql<string>`'CAUTION_RETURNED'`,
					createdAt: accommodation.checkedOutAt,
				})
				.from(accommodation)
				.leftJoin(customUser, eq(customUser.userId, accommodation.userId))
				.where(
					sql`${accommodation.accommodationRequired} = true AND ${accommodation.cautionReturned} = true AND ${accommodation.checkedOutAt} IS NOT NULL`,
				);

			// Query 3: Onspot Payments
			const onspotRows = await db
				.select({
					id: onspotPayments.id,
					userId: onspotPayments.userId,
					synergyId: customUser.synergyId,
					fullname: customUser.fullname,
					phone: customUser.phone,
					amount: onspotPayments.amount,
					type: sql<string>`CASE WHEN ${onspotPayments.isEventPass} THEN 'ONSPOT_EVENT_PASS' ELSE 'ONSPOT_WORKSHOP' END`,
					createdAt: onspotPayments.createdAt,
				})
				.from(onspotPayments)
				.leftJoin(customUser, eq(customUser.userId, onspotPayments.userId));

			const allTransactions: GajanaTransaction[] = [
				...accommRows.map((r) => ({ ...r, amount: Number(r.amount) })),
				...depositRows.map((r) => ({ ...r, amount: Number(r.amount) })),
				...returnedDepositRows.map((r) => ({ ...r, amount: Number(r.amount) })),
				...onspotRows.map((r) => ({ ...r, amount: Number(r.amount) })),
			].sort((a, b) => {
				const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
				const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
				return timeB - timeA;
			});

			const totalAmount = allTransactions.reduce(
				(acc, curr) => acc + curr.amount,
				0,
			);

			return {
				data: {
					totalAmount,
					rows: allTransactions,
				},
			};
		} catch (e) {
			console.error("Failed to fetch Gajana data:", e);
			throw new Error("Failed to fetch Gajana data");
		}
	},
);

export const getHostelStats = createServerFn({ method: "GET" }).handler(
	async () => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		const stats = await db
			.select({
				hostelName: accommodation.hostelName,
				floor: accommodation.floor,
				count: sql<number>`count(*)::int`,
			})
			.from(accommodation)
			.where(
				and(
					isNotNull(accommodation.checkedInAt),
					isNull(accommodation.checkedOutAt),
					isNotNull(accommodation.hostelName),
					isNotNull(accommodation.floor),
				),
			)
			.groupBy(accommodation.hostelName, accommodation.floor);

		return stats;
	},
);
