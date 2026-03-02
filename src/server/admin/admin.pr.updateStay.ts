import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNotNull } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { accommodation } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";
import { getAccommodationPricing } from "@/server/admin/admin.pr.pricing";

const UpdateStayInputSchema = z.object({
	userId: z.string().min(1),
	nightsRequested: z.number().int().min(0),
	hostelName: z.string().nullable(),
	floor: z.string().nullable(),
	paymentVerified: z.boolean(),
});

export const updateStay = createServerFn({ method: "POST" })
	.inputValidator(UpdateStayInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		const [stayRecord] = await db
			.select({
				id: accommodation.id,
				accommodationRequired: accommodation.accommodationRequired,
				nightsRequested: accommodation.nightsRequested,
				checkedInAt: accommodation.checkedInAt,
				checkedOutAt: accommodation.checkedOutAt,
			})
			.from(accommodation)
			.where(eq(accommodation.userId, data.userId))
			.limit(1);

		if (!stayRecord) {
			throw new Error("Stay not found");
		}

		if (!stayRecord.checkedInAt) {
			throw new Error("User not checked in");
		}

		const normalizedNightsRequested = stayRecord.accommodationRequired
			? data.nightsRequested
			: 0;

		if (stayRecord.accommodationRequired && normalizedNightsRequested <= 0) {
			throw new Error(
				"nightsRequested must be greater than 0 for accommodation stays",
			);
		}

		const nightsChanged =
			normalizedNightsRequested !== stayRecord.nightsRequested;

		if (nightsChanged && !data.paymentVerified) {
			throw new Error(
				"Payment verification is required when nights requested changes",
			);
		}

		const { roomPrice } = await getAccommodationPricing();
		const totalAccommodationFee = stayRecord.accommodationRequired
			? roomPrice * normalizedNightsRequested
			: 0;

		const [updatedStay] = await db
			.update(accommodation)
			.set({
				nightsRequested: normalizedNightsRequested,
				accommodationFee: totalAccommodationFee,
				hostelName: data.hostelName,
				floor: data.floor,
				paymentVerified: data.paymentVerified,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(accommodation.id, stayRecord.id),
					isNotNull(accommodation.checkedInAt),
				),
			)
			.returning({
				id: accommodation.id,
				userId: accommodation.userId,
				nightsRequested: accommodation.nightsRequested,
				accommodationFee: accommodation.accommodationFee,
				hostelName: accommodation.hostelName,
				floor: accommodation.floor,
				paymentVerified: accommodation.paymentVerified,
				updatedAt: accommodation.updatedAt,
			});

		if (!updatedStay) {
			throw new Error("Failed to update stay details");
		}

		return updatedStay;
	});
