import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNotNull } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { accommodation } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";

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
