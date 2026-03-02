import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accommodation } from "@/db/schema";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export async function fetchStayByUserId(userId: string) {
	const [stay] = await db
		.select()
		.from(accommodation)
		.where(eq(accommodation.userId, userId))
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
}
