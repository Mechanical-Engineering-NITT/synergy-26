import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { users } from "@/db/users-schema";

export const getAppUserByUserID = createServerFn()
	.inputValidator((data: { id: string }) => data)
	.handler(async ({ data }) => {
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.userid, data.id))
			.limit(1);
		return user ?? null;
	});

export const getAuthUserByUserID = createServerFn()
	.inputValidator((data: { id: string }) => data)
	.handler(async ({ data }) => {
		const [appUser] = await db
			.select()
			.from(user)
			.where(eq(user.id, data.id))
			.limit(1);
		return appUser ?? null;
	});
