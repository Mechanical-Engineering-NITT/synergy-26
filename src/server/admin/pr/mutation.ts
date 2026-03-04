import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNotNull } from "drizzle-orm";
import * as z from "zod";
import { FLOORS, HOSTELS } from "@/constants/hostels";
import { db } from "@/db";
import { accommodation } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";
import { getAccommodationPricing } from "@/server/admin/pr/utils";

const CreateStayInputSchema = z
	.object({
		userId: z.string().min(1),
		accommodationRequired: z.boolean(),
		nightsRequested: z.number().int().min(0),
		hostelName: z.enum(HOSTELS).nullable(),
		floor: z.enum(FLOORS).nullable(),
		paymentVerified: z.boolean(),
	})
	.refine((data) => !data.accommodationRequired || data.nightsRequested > 0, {
		message:
			"nightsRequested must be greater than 0 when accommodation is required",
		path: ["nightsRequested"],
	})
	.refine(
		(data) =>
			!data.accommodationRequired ||
			(data.hostelName !== null && data.floor !== null),
		{
			message:
				"hostelName and floor are required when accommodation is required",
			path: ["hostelName"],
		},
	);

export const createStay = createServerFn({ method: "POST" })
	.inputValidator(CreateStayInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		if (data.accommodationRequired && !data.paymentVerified) {
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
				paymentVerified: true,
				checkedInAt: new Date(),
			})
			.onConflictDoNothing({ target: accommodation.userId })
			.returning({
				id: accommodation.id,
				userId: accommodation.userId,
				accommodationRequired: accommodation.accommodationRequired,
				nightsRequested: accommodation.nightsRequested,
				accommodationFee: accommodation.accommodationFee,
				cautionDeposit: accommodation.cautionDeposit,
				checkedInAt: accommodation.checkedInAt,
			});

		if (!createdStay) {
			throw new Error("Stay record already exists for this user");
		}

		return createdStay;
	});

const UpdateStayInputSchema = z.object({
	userId: z.string().min(1),
	nightsRequested: z.number().int().min(0),
	hostelName: z.enum(HOSTELS).nullable(),
	floor: z.enum(FLOORS).nullable(),
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

		if (
			stayRecord.accommodationRequired &&
			(data.hostelName === null || data.floor === null)
		) {
			throw new Error(
				"hostelName and floor are required for accommodation stays",
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

const CompleteStayInputSchema = z.object({
	userId: z.string().min(1),
	fineAmount: z.number().int().min(0),
	finePaid: z.boolean(),
	cautionReturned: z.boolean(),
});

export const completeStay = createServerFn({ method: "POST" })
	.inputValidator(CompleteStayInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		const [stay] = await db
			.select({
				id: accommodation.id,
				accommodationRequired: accommodation.accommodationRequired,
				checkedInAt: accommodation.checkedInAt,
				checkedOutAt: accommodation.checkedOutAt,
			})
			.from(accommodation)
			.where(eq(accommodation.userId, data.userId))
			.limit(1);

		if (!stay) {
			throw new Error("Stay not found");
		}

		if (!stay.checkedInAt) {
			throw new Error("User not checked in");
		}

		const isNoAccommodation = !stay.accommodationRequired;
		const normalizedData = isNoAccommodation
			? {
					fineAmount: 0,
					finePaid: false,
					cautionReturned: false,
				}
			: {
					fineAmount: data.fineAmount,
					finePaid: data.finePaid,
					cautionReturned: data.cautionReturned,
				};

		const fineApplicable = normalizedData.fineAmount > 0;

		if (!isNoAccommodation && fineApplicable) {
			if (!normalizedData.finePaid) {
				throw new Error(
					"Fine must be marked as paid when fine amount is greater than 0",
				);
			}

			if (normalizedData.cautionReturned) {
				throw new Error("Deposit must be retained when a fine is applied");
			}
		} else if (!isNoAccommodation) {
			if (normalizedData.finePaid) {
				throw new Error("Fine cannot be marked as paid when fine amount is 0");
			}

			if (!normalizedData.cautionReturned) {
				throw new Error("Deposit must be returned when no fine is applied");
			}
		}

		const [updatedStay] = await db
			.update(accommodation)
			.set({
				fineAmount: normalizedData.fineAmount,
				finePaid: normalizedData.finePaid,
				cautionReturned: normalizedData.cautionReturned,
				checkedOutAt: stay.checkedOutAt ?? new Date(),
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(accommodation.id, stay.id),
					isNotNull(accommodation.checkedInAt),
				),
			)
			.returning({
				id: accommodation.id,
				userId: accommodation.userId,
				fineAmount: accommodation.fineAmount,
				finePaid: accommodation.finePaid,
				cautionReturned: accommodation.cautionReturned,
				checkedOutAt: accommodation.checkedOutAt,
			});

		if (!updatedStay) {
			throw new Error("Failed to update stay checkout details");
		}

		return updatedStay;
	});
