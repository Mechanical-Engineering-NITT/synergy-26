import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { accommodation } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const GetStayDetailsInputSchema = z.object({
	userId: z.string().min(1),
});

export const getStayDetails = createServerFn({ method: "GET" })
	.inputValidator(GetStayDetailsInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		const [stayData] = await db
			.select()
			.from(accommodation)
			.where(eq(accommodation.userId, data.userId))
			.limit(1);

		if (!stayData) {
			throw new Error("Stay record not found for this user");
		}

		if (!stayData.checkedInAt) {
			throw new Error("User is not checked in");
		}

		const elapsedDays = Math.max(
			0,
			Math.floor((Date.now() - stayData.checkedInAt.getTime()) / ONE_DAY_IN_MS),
		);

		const overstayed = stayData.accommodationRequired
			? elapsedDays > stayData.nightsRequested
			: false;

		return {
			nightsRequested: stayData.nightsRequested,
			elapsedDays,
			overstayed,
			stayData,
		};
	});
