import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNotNull } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { payments, registrations, workshops } from "@/db/schema";
import { getCurrentSession, requireOnBoardedUser } from "@/lib/utils";
import { hasPaidForWorkshop } from "./razorpay";

export const getAllWorkshops = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getCurrentSession();
		const allWorkshops = await db.select().from(workshops);

		if (!session) {
			return allWorkshops.map((workshop) => ({
				...workshop,
				isRegistered: false,
				isPaid: false,
			}));
		}

		const userRegistrations = await db
			.select()
			.from(registrations)
			.where(eq(registrations.userId, session.user.id));

		const workshopIds = new Set(
			userRegistrations.map((r) => r.workshopId).filter(Boolean),
		);

		const paidWorkshops = await db
			.select({ workshopId: payments.workshopId })
			.from(payments)
			.where(
				and(
					eq(payments.userId, session.user.id),
					eq(payments.status, "paid"),
					isNotNull(payments.workshopId),
				),
			);

		const paidWorkshopIds = new Set(paidWorkshops.map((p) => p.workshopId));

		return allWorkshops.map((workshop) => ({
			...workshop,
			isRegistered: workshopIds.has(workshop.id),
			isPaid: paidWorkshopIds.has(workshop.id),
		}));
	},
);

export const registerForWorkshop = createServerFn({ method: "POST" })
	.inputValidator(z.object({ workshopId: z.number() }))
	.handler(async ({ data }) => {
		const user = await requireOnBoardedUser();

		const isPaid = await hasPaidForWorkshop(user.id, data.workshopId);
		if (!isPaid) {
			throw new Error("You must pay for this workshop before registering");
		}

		const existing = await db
			.select()
			.from(registrations)
			.where(
				and(
					eq(registrations.userId, user.id),
					eq(registrations.workshopId, data.workshopId),
				),
			);

		if (existing.length > 0) {
			throw new Error("Already registered for this workshop");
		}

		await db.insert(registrations).values({
			userId: user.id,
			workshopId: data.workshopId,
		});

		return { success: true };
	});
