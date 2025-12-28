import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { user } from "@/db/auth-schema";
import { users } from "@/db/users-schema";

const registerSchema = z.object({
	fullname: z.string().min(1, "Full Name is required"),
	college: z.string().min(1, "College is required"),
	city: z.string().min(1, "City is required"),
	department: z.string().min(1, "Department is required"),
	year: z.string().min(1, "Year is required"),
	phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
	gender: z.enum(["male", "female", "other"]),
});

export const createUserOnce = async (userId: string, name: string) => {
	const { db } = await import("../db");
	const [user] = await db
		.insert(users)
		.values({
			userid: userId,
			fullname: name,
		})
		.onConflictDoNothing()
		.returning();

	if (user) {
		return user;
	} else {
		const { getAppUserByUserID } = await import("./db-user-select");
		const existingUser = await getAppUserByUserID(userId);
		return existingUser;
	}
};

export const registerUser = createServerFn({ method: "POST" })
	.inputValidator(registerSchema)
	.handler(async ({ data }) => {
		const { db } = await import("../db");
		const { getSession } = await import("./session");
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
