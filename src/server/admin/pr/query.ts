import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { accommodation } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";
import { getAccommodationPricing } from "@/server/admin/pr/utils";
import { getConstantValue } from "@/server/constants";

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
