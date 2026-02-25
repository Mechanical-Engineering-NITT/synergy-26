import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { customUser } from "@/db/schema";
import { parseAndThrow, requireOnBoardedUser } from "@/lib/utils";
import { UserInputSchema } from "@/routes/register";

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

export const updateUserDetails = createServerFn({ method: "POST" })
	.inputValidator(UserInputSchema)
	.handler(async ({ data }) => {
		const userSession = await requireOnBoardedUser();
		const parsedData = parseAndThrow(data, UserInputSchema);

		try {
			await db
				.update(customUser)
				.set({
					fullname: parsedData.fullname,
					college: parsedData.college,
					city: parsedData.city,
					department: parsedData.department,
					year: parsedData.year,
					phone: parsedData.phone,
					gender: parsedData.gender,
				})
				.where(eq(customUser.userId, userSession.id));

			return { success: true };
		} catch (error) {
			throw new Error(
				`Failed to update profile: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	});

export const getCurrentUserFullName = createServerFn({ method: "GET" })
	.inputValidator(z.object({ userId: z.string().nullable() }))
	.handler(async ({ data }) => {
		if (!data.userId) {
			return null;
		}

		const [dbUser] = await db
			.select({
				id: customUser.userId,
				fullname: customUser.fullname,
			})
			.from(customUser)
			.where(eq(customUser.userId, data.userId))
			.limit(1);
		return dbUser;
	});
