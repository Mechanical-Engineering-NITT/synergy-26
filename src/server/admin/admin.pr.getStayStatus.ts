import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { requireAdminUser } from "@/lib/utils";
import { fetchStayByUserId } from "./admin.pr.fetchStay";

const GetStayStatusInputSchema = z.object({
	userId: z.string().min(1),
});

export const getStayStatus = createServerFn({ method: "GET" })
	.inputValidator(GetStayStatusInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		const result = await fetchStayByUserId(data.userId);
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
