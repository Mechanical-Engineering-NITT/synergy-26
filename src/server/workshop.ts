import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { registrations, workshops } from "@/db/schema";
import { getCurrentSession } from "@/lib/utils";

export const getAllWorkshops = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getCurrentSession();
		const allWorkshops = await db.select().from(workshops);

		if (!session) {
			return allWorkshops.map((workshop) => ({
				...workshop,
				isRegistered: false,
			}));
		}

		const userRegistrations = await db
			.select()
			.from(registrations)
			.where(eq(registrations.userId, session.user.id));

		const workshopIds = new Set(
			userRegistrations.map((r) => r.workshopId).filter(Boolean),
		);

		return allWorkshops.map((workshop) => ({
			...workshop,
			isRegistered: workshopIds.has(workshop.id),
		}));
	},
);
