import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { customUser } from "@/db/schema";
import { getCurrentSession, parseAndThrow } from "@/lib/utils";
import { UserInputSchema } from "@/routes/register";

const RegisterUserInputSchema = z.object({
	userId: z.string(),
	values: UserInputSchema,
});

export const registerUser = createServerFn({ method: "POST" })
	.inputValidator(RegisterUserInputSchema)
	.handler(async ({ data }) => {
		try {
			const session = await getCurrentSession();
			if (
				!session ||
				session.user.onBoardingComplete ||
				session.user.id !== data.userId
			) {
				throw redirect({
					to: "/",
				});
			}

			const parsedData = parseAndThrow(data, RegisterUserInputSchema);

			await db.transaction(async (tx) => {
				const [existingUser] = await tx
					.select()
					.from(customUser)
					.where(eq(customUser.userId, parsedData.userId));
				if (existingUser) {
					throw new Error("User has already registered");
				}

				await tx.insert(customUser).values({
					userId: parsedData.userId,
					fullname: parsedData.values.fullname,
					college: parsedData.values.college,
					city: parsedData.values.city,
					department: parsedData.values.department,
					year: parsedData.values.year,
					phone: parsedData.values.phone,
					gender: parsedData.values.gender,
				});

				await tx
					.update(user)
					.set({ onBoardingComplete: true })
					.where(eq(user.id, parsedData.userId));
			});
		} catch (error) {
			throw new Error(
				`Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}

		return { ok: true };
	});
