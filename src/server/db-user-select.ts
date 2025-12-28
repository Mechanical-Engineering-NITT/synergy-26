import { db } from "@/db";
import { users } from "@/db/users-schema";
import { user } from "@/db/auth-schema";
import { eq } from "drizzle-orm";

export const getAppUserByUserID = async (id: string) => {
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.userid, id))
		.limit(1);
	return user ?? null;
};

export const getAuthUserByUserID = async (id: string) => {
	const [appUser] = await db
		.select()
		.from(user)
		.where(eq(user.id, id))
		.limit(1);
	return appUser ?? null;
};
