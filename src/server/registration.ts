import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import type z from "zod";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { customUser } from "@/db/schema";
import { userRequiredMiddleware } from "@/lib/middleware";
import { UserInputSchema } from "@/routes/register";

export const registerUser = createServerFn({ method: "POST" })
	.middleware([userRequiredMiddleware])
	.inputValidator(
		(data: { userId: string; values: z.infer<typeof UserInputSchema> }) => {
			const parsedData = UserInputSchema.safeParse(data.values);
			if (!parsedData.success) {
				const errorMessage = parsedData.error.issues
					.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
					.join(", ");
				throw new Error(`Invalid input data: ${errorMessage}`);
			}
			return { userId: data.userId, values: parsedData.data };
		},
	)
	.handler(async ({ data }) => {
		try {
			await db.transaction(async (tx) => {
				const [existingUser] = await tx
					.select()
					.from(customUser)
					.where(eq(customUser.userId, data.userId));
				if (existingUser) {
					throw new Error("User has already registered");
				}

				await tx.insert(customUser).values({
					userId: data.userId,
					fullname: data.values.fullname,
					college: data.values.college,
					city: data.values.city,
					department: data.values.department,
					year: data.values.year,
					phone: data.values.phone,
					gender: data.values.gender,
				});

				await tx
					.update(user)
					.set({ onBoardingComplete: true })
					.where(eq(user.id, data.userId));
			});
		} catch (error) {
			throw new Error(
				`Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}

		return { ok: true };
	});
