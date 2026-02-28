import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
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

		const [stayRecord] = await db
			.select({
				id: accommodation.id,
				checkedInAt: accommodation.checkedInAt,
				checkedOutAt: accommodation.checkedOutAt,
			})
			.from(accommodation)
			.where(eq(accommodation.userId, data.userId))
			.limit(1);

		if (!stayRecord) {
			throw new Error("Stay record not found for this user");
		}

		if (!stayRecord.checkedInAt) {
			throw new Error("User is not checked in");
		}

		if (stayRecord.checkedOutAt) {
			throw new Error("User has already checked out");
		}

		const [updatedStay] = await db
			.update(accommodation)
			.set({
				fineAmount: data.fineAmount,
				finePaid: data.finePaid,
				cautionReturned: data.cautionReturned,
				checkedOutAt: new Date(),
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(accommodation.id, stayRecord.id),
					isNotNull(accommodation.checkedInAt),
					isNull(accommodation.checkedOutAt),
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
			throw new Error("Stay cannot be modified after checkout");
		}

		return updatedStay;
	});
