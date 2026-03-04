import { createServerFn } from "@tanstack/react-start";
import { and, count, eq, notExists } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { customUser, events, registrations, workshops } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";

export const getEventData = createServerFn({ method: "GET" }).handler(
	async () => {
		await requireAdminUser({ data: { roles: ["MASTER", "ADMIN"] } });

		try {
			const eventsData = await db
				.select({
					id: events.id,
					title: events.title,
					registered_users: count(registrations.userId),
				})
				.from(events)
				.leftJoin(registrations, eq(events.id, registrations.eventId))
				.groupBy(events.id);

			return eventsData;
		} catch {
			throw new Error("Failed to fetch event data");
		}
	},
);

export const EventDataHeader = ["ID", "Title", "Registered Users"];

export const getWorkshopData = createServerFn({ method: "GET" }).handler(
	async () => {
		await requireAdminUser({ data: { roles: ["MASTER", "ADMIN"] } });

		try {
			const workshopsData = await db
				.select({
					id: workshops.id,
					title: workshops.title,
					price: workshops.price,
					registered_users: count(registrations.userId),
				})
				.from(workshops)
				.leftJoin(registrations, eq(workshops.id, registrations.workshopId))
				.groupBy(workshops.id);

			return workshopsData;
		} catch {
			throw new Error("Failed to fetch workshop data");
		}
	},
);

export const WorkshopDataHeader = ["ID", "Title", "Price", "Registered Users"];

export const getUserData = createServerFn({ method: "GET" }).handler(
	async () => {
		await requireAdminUser({ data: { roles: ["MASTER", "ADMIN"] } });

		try {
			const userDataRows = await db
				.select({
					userId: user.id,
					synergyId: customUser.synergyId,
					email: user.email,
					fullname: customUser.fullname,
					phone: customUser.phone,
					college: customUser.college,
					city: customUser.city,
					year: customUser.year,
					department: customUser.department,
					eventTitle: events.title,
					workshopTitle: workshops.title,
				})
				.from(user)
				.leftJoin(customUser, eq(user.id, customUser.userId))
				.leftJoin(registrations, eq(user.id, registrations.userId))
				.leftJoin(events, eq(registrations.eventId, events.id))
				.leftJoin(workshops, eq(registrations.workshopId, workshops.id));

			const userDataMap = new Map<
				string,
				{
					userId: string;
					synergyId: string | null;
					email: string;
					fullname: string | null;
					phone: string | null;
					college: string | null;
					city: string | null;
					year: string | null;
					department: string | null;
					registeredEvents: Set<string>;
					registeredWorkshops: Set<string>;
				}
			>();

			for (const row of userDataRows) {
				let currentUser = userDataMap.get(row.userId);

				if (!currentUser) {
					currentUser = {
						userId: row.userId,
						synergyId: row.synergyId,
						email: row.email,
						fullname: row.fullname,
						phone: row.phone,
						college: row.college,
						city: row.city,
						year: row.year,
						department: row.department,
						registeredEvents: new Set<string>(),
						registeredWorkshops: new Set<string>(),
					};
					userDataMap.set(row.userId, currentUser);
				}

				if (row.eventTitle) {
					currentUser.registeredEvents.add(row.eventTitle);
				}

				if (row.workshopTitle) {
					currentUser.registeredWorkshops.add(row.workshopTitle);
				}
			}

			return Array.from(userDataMap.values()).map(
				({ registeredEvents, registeredWorkshops, ...currentUser }) => ({
					...currentUser,
					registeredEvents: Array.from(registeredEvents),
					registeredWorkshops: Array.from(registeredWorkshops),
				}),
			);
		} catch {
			throw new Error("Failed to fetch user data");
		}
	},
);

export const UserDataHeader = [
	"Synergy ID",
	"Email",
	"Full Name",
	"Phone",
	"College",
	"City",
	"Year",
	"Department",
	"Registered Events",
	"Registered Workshops",
];

export const getUserDataByEventId = createServerFn({ method: "GET" })
	.inputValidator(z.object({ eventId: z.number() }))
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["MASTER", "ADMIN"] } });

		try {
			const userDataByEventId = await db
				.select({
					userId: user.id,
					synergyId: customUser.synergyId,
					email: user.email,
					fullname: customUser.fullname,
					phone: customUser.phone,
					college: customUser.college,
					city: customUser.city,
					year: customUser.year,
					department: customUser.department,
				})
				.from(user)
				.leftJoin(customUser, eq(user.id, customUser.userId))
				.innerJoin(
					registrations,
					and(
						eq(user.id, registrations.userId),
						eq(registrations.eventId, data.eventId),
					),
				);

			return userDataByEventId;
		} catch {
			throw new Error("Failed to fetch user data by event ID");
		}
	});

export const UserDataByEventIdHeader = [
	"Synergy ID",
	"Email",
	"Full Name",
	"Phone",
	"College",
	"City",
	"Year",
	"Department",
];

export const getUserDataByWorkshopId = createServerFn({ method: "GET" })
	.inputValidator(z.object({ workshopId: z.number() }))
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["MASTER", "ADMIN"] } });

		try {
			const userDataByWorkshopId = await db
				.select({
					userId: user.id,
					synergyId: customUser.synergyId,
					email: user.email,
					fullname: customUser.fullname,
					phone: customUser.phone,
					college: customUser.college,
					city: customUser.city,
					year: customUser.year,
					department: customUser.department,
				})
				.from(user)
				.leftJoin(customUser, eq(user.id, customUser.userId))
				.innerJoin(
					registrations,
					and(
						eq(user.id, registrations.userId),
						eq(registrations.workshopId, data.workshopId),
					),
				);

			return userDataByWorkshopId;
		} catch {
			throw new Error("Failed to fetch user data by workshop ID");
		}
	});

export const UserDataByWorkshopIdHeader = [
	"Synergy ID",
	"Email",
	"Full Name",
	"Phone",
	"College",
	"City",
	"Year",
	"Department",
];

export const getInactiveUsers = createServerFn({ method: "GET" }).handler(
	async () => {
		await requireAdminUser({ data: { roles: ["MASTER", "ADMIN"] } });

		try {
			const inactiveUsers = await db
				.select({
					userId: user.id,
					synergyId: customUser.synergyId,
					email: user.email,
					fullname: customUser.fullname,
					phone: customUser.phone,
					college: customUser.college,
					city: customUser.city,
					year: customUser.year,
					department: customUser.department,
				})
				.from(customUser)
				.innerJoin(user, eq(customUser.userId, user.id))
				.where(
					notExists(
						db
							.select({ id: registrations.id })
							.from(registrations)
							.where(eq(registrations.userId, customUser.userId)),
					),
				);

			return inactiveUsers;
		} catch {
			throw new Error("Failed to fetch inactive users");
		}
	},
);

export const InactiveUsersHeader = [
	"Synergy ID",
	"Email",
	"Full Name",
	"Phone",
	"College",
	"City",
	"Year",
	"Department",
];
