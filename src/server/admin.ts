import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { getCurrentSession } from "@/lib/utils";
import { user } from "@/db/auth-schema";
import { eq } from "drizzle-orm";

export const makeAdmin = createServerFn().handler(async () => {
	try {
		const session = await getCurrentSession();
		if (!session) {
			throw new Error("Unauthorized");
		}
		await db.transaction(async (tx) => {
			await tx
				.update(user)
				.set({ role: "ADMIN" })
				.where(eq(user.id, session.user.id));
		});
	} catch (error) {
		throw new Error(
			`Making admin failed: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
});

export const makeUser = createServerFn().handler(async () => {
	try {
		const session = await getCurrentSession();
		if (!session) {
			throw new Error("Unauthorized");
		}
		await db.transaction(async (tx) => {
			await tx
				.update(user)
				.set({ role: "USER" })
				.where(eq(user.id, session.user.id));
		});
	} catch (error) {
		throw new Error(
			`Making user failed: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
});
