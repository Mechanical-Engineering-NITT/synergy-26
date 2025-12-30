import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { users } from "@/db/users-schema";
import { getAppUserByUserID } from "./db-user-select";
import { getSession } from "./session";

const registerSchema = z.object({
	fullname: z.string().min(1, "Full Name is required"),
	college: z.string().min(1, "College is required"),
	city: z.string().min(1, "City is required"),
	department: z.string().min(1, "Department is required"),
	year: z.string().min(1, "Year is required"),
	phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
	gender: z.enum(["male", "female", "other"]),
});

export const createUserOnce = createServerFn()
	.inputValidator((data: { userId: string; name: string }) => data)
	.handler(async ({ data }) => {
		const { db } = await import("../db");
		const [user] = await db
			.insert(users)
			.values({
				userid: data.userId,
				fullname: data.name,
			})
			.onConflictDoNothing()
			.returning();

		if (user) {
			return user;
		} else {
			const existingUser = await getAppUserByUserID({
				data: { id: data.userId },
			});
			return existingUser;
		}
	});

export const registerUser = createServerFn({ method: "POST" })
	.inputValidator(registerSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Not authenticated");

		await db
			.update(users)
			.set({
				fullname: data.fullname,
				college: data.college,
				city: data.city,
				department: data.department,
				year: data.year,
				phone: data.phone,
				gender: data.gender,
			})
			.where(eq(users.userid, session.user.id));

		await db
			.update(user)
			.set({ onBoardingComplete: true })
			.where(eq(user.id, session.user.id));

		return { success: true };
	});
