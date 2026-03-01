import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { accommodation } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const GetStayStatusInputSchema = z.object({
	userId: z.string().min(1),
});

export const getStayStatus = createServerFn({ method: "GET" })
	.inputValidator(GetStayStatusInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		const [stay] = await db
			.select({
				accommodationRequired: accommodation.accommodationRequired,
				nightsRequested: accommodation.nightsRequested,
				accommodationFee: accommodation.accommodationFee,
				cautionDeposit: accommodation.cautionDeposit,
				hostelName: accommodation.hostelName,
				floor: accommodation.floor,
				paymentVerified: accommodation.paymentVerified,
				fineAmount: accommodation.fineAmount,
				finePaid: accommodation.finePaid,
				cautionReturned: accommodation.cautionReturned,
				checkedInAt: accommodation.checkedInAt,
				checkedOutAt: accommodation.checkedOutAt,
				updatedAt: accommodation.updatedAt,
			})
			.from(accommodation)
			.where(eq(accommodation.userId, data.userId))
			.limit(1);

		const elapsedDays = stay?.checkedInAt
			? Math.max(
					0,
					Math.floor((Date.now() - stay.checkedInAt.getTime()) / ONE_DAY_IN_MS),
				)
			: 0;

		const nightsRequested = stay?.nightsRequested ?? 0;
		const overstayed =
			!!stay?.checkedInAt &&
			!stay?.checkedOutAt &&
			stay?.accommodationRequired === true
				? elapsedDays > nightsRequested
				: false;

		return {
			exists: !!stay,
			accommodationRequired: stay?.accommodationRequired ?? false,
			nightsRequested,
			accommodationFee: stay?.accommodationFee ?? 0,
			cautionDeposit: stay?.cautionDeposit ?? 0,
			hostelName: stay?.hostelName ?? null,
			floor: stay?.floor ?? null,
			paymentVerified: stay?.paymentVerified ?? false,
			fineAmount: stay?.fineAmount ?? 0,
			finePaid: stay?.finePaid ?? false,
			cautionReturned: stay?.cautionReturned ?? false,
			checkedInAt: stay?.checkedInAt || null,
			checkedOutAt: stay?.checkedOutAt || null,
			updatedAt: stay?.updatedAt || null,
			elapsedDays,
			overstayed,
		};
	});
