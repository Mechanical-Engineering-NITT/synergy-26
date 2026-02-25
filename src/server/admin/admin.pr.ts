import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNotNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { customUser, events, payments, workshops } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";

export const getPRData = createServerFn({ method: "GET" }).handler(async () => {
	await requireAdminUser(["ADMIN-PR", "ADMIN-MASTER"]);

	try {
		const userData = await db
			.select({
				userId: user.id,
				email: user.email,
				fullname: customUser.fullname,
				phone: customUser.phone,
			})
			.from(user)
			.leftJoin(customUser, eq(user.id, customUser.userId));

		const eventAccessCondition = and(
			eq(payments.status, "paid"),
			or(eq(payments.isEventPass, true), isNotNull(payments.workshopId)),
		);

		const eventDetails = await db
			.select({
				userId: payments.userId,
				hasEventEntitlement: sql<boolean>`bool_or(${eventAccessCondition})`,
			})
			.from(payments)
			.groupBy(payments.userId);

		const workshopDetails = await db
			.select({
				userId: payments.userId,
				workshopId: payments.workshopId,
			})
			.from(payments)
			.where(and(eq(payments.status, "paid"), isNotNull(payments.workshopId)));

		const allEvents = await db.select().from(events);
		const allWorkshops = await db.select().from(workshops);

		const eventEntitlementMap = new Map(
			eventDetails.map((entry) => [entry.userId, entry.hasEventEntitlement]),
		);

		const workshopAccessMap = new Map<string, Set<number>>();

		workshopDetails.forEach((entry) => {
			if (entry.workshopId === null) {
				return;
			}

			if (!workshopAccessMap.has(entry.userId)) {
				workshopAccessMap.set(entry.userId, new Set<number>());
			}

			workshopAccessMap.get(entry.userId)?.add(entry.workshopId);
		});

		const prDataSet = userData.map((userRow) => {
			const hasEventEntitlement =
				eventEntitlementMap.get(userRow.userId) ?? false;
			const userWorkshopIds =
				workshopAccessMap.get(userRow.userId) ?? new Set<number>();
			const eventAccess: Record<number, boolean> = {};
			for (const event of allEvents) {
				eventAccess[event.id] = hasEventEntitlement;
			}

			const workshopAccess: Record<number, boolean> = {};
			for (const workshop of allWorkshops) {
				workshopAccess[workshop.id] =
					hasEventEntitlement || userWorkshopIds.has(workshop.id);
			}

			return {
				userId: userRow.userId,
				email: userRow.email,
				fullname: userRow.fullname,
				phone: userRow.phone,
				events: eventAccess,
				workshops: workshopAccess,
			};
		});

		const eventMeta: Record<number, string> = Object.fromEntries(
			allEvents.map((event) => [event.id, event.title]),
		);

		const workshopMeta: Record<number, string> = Object.fromEntries(
			allWorkshops.map((workshop) => [workshop.id, workshop.title]),
		);

		return {
			data: {
				rows: prDataSet,
				eventMeta,
				workshopMeta,
			},
		};
	} catch {
		throw new Error("Failed to fetch PR data");
	}
});

export const prHeaderRow = ["User Data", "Events", "Workshops"];
