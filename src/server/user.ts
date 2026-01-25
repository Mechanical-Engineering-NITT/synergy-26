import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customUser } from "@/db/schema";
import { requireOnBoardedUser } from "@/lib/utils";

export const getUserDetails = createServerFn({ method: "GET" }).handler(
	async () => {
		const user = await requireOnBoardedUser();

		const [details] = await db
			.select()
			.from(customUser)
			.where(eq(customUser.userId, user.id))
			.limit(1);

		if (!details) {
			throw new Error("User details not found");
		}

		return {
			...details,
			email: user.email,
		};
	},
);
