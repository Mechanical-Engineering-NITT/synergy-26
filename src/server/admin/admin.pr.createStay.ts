import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { accommodation } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";
import { getAccommodationPricing } from "./admin.pr.pricing";

const CreateStayInputSchema = z
	.object({
		userId: z.string().min(1),
		accommodationRequired: z.boolean(),
		nightsRequested: z.number().int().min(0),
		hostelName: z.string().nullable(),
		floor: z.string().nullable(),
		roomNumber: z.string().nullable(),
		paymentVerified: z.boolean(),
	})
	.refine((data) => !data.accommodationRequired || data.nightsRequested > 0, {
		message:
			"nightsRequested must be greater than 0 when accommodation is required",
		path: ["nightsRequested"],
	});

export const createStay = createServerFn({ method: "POST" })
	.inputValidator(CreateStayInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		const [existingStay] = await db
			.select({ id: accommodation.id })
			.from(accommodation)
			.where(eq(accommodation.userId, data.userId))
			.limit(1);

		if (existingStay) {
			throw new Error("Stay record already exists for this user");
		}

		if (!data.paymentVerified) {
			throw new Error("Payment must be verified before check-in");
		}

		const { roomPrice, depositAmount } = await getAccommodationPricing();
		const normalizedNightsRequested = data.accommodationRequired
			? data.nightsRequested
			: 0;

		const totalAccommodationFee = data.accommodationRequired
			? roomPrice * normalizedNightsRequested
			: 0;

		const [createdStay] = await db
			.insert(accommodation)
			.values({
				userId: data.userId,
				accommodationRequired: data.accommodationRequired,
				nightsRequested: normalizedNightsRequested,
				accommodationFee: totalAccommodationFee,
				cautionDeposit: depositAmount,
				hostelName: data.hostelName,
				floor: data.floor,
				roomNumber: data.roomNumber,
				paymentVerified: true,
				checkedInAt: new Date(),
			})
			.returning({
				id: accommodation.id,
				userId: accommodation.userId,
				accommodationRequired: accommodation.accommodationRequired,
				nightsRequested: accommodation.nightsRequested,
				accommodationFee: accommodation.accommodationFee,
				cautionDeposit: accommodation.cautionDeposit,
				checkedInAt: accommodation.checkedInAt,
			});

		return createdStay;
	});
