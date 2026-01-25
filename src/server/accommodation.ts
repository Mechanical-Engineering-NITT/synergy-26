import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { getCurrentSession } from "@/lib/utils";
import { getConstantValue } from "./constants";

export const getPaidAccommodationNights = createServerOnlyFn(
	async (userId: string) => {
		const [result] = await db
			.select({ total: sql<number>`sum(${payments.accommodation})` })
			.from(payments)
			.where(and(eq(payments.userId, userId), eq(payments.status, "paid")));
		return Number(result?.total || 0);
	},
);

export const getAccommodationStatus = createServerFn({ method: "GET" }).handler(
	createServerOnlyFn(async () => {
		const session = await getCurrentSession();
		const roomPrice = Number((await getConstantValue("room")) || 0);
		const paidNights = session
			? await getPaidAccommodationNights(session.user.id)
			: 0;

		return {
			isLoggedIn: !!session,
			paidNights,
			roomPrice,
			maxNights: 3,
		};
	}),
);
