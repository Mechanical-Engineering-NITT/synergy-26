import { createServerFn } from "@tanstack/react-start";
import { and, count, eq } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { customUser, events, registrations, workshops } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";

export const getEventData = createServerFn({ method: "GET" }).handler(
	async () => {
		await requireAdminUser({ data: { roles: "ADMIN-MASTER" } });

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
		await requireAdminUser({ data: { roles: "ADMIN-MASTER" } });

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
		await requireAdminUser({ data: { roles: "ADMIN-MASTER" } });

		try {
			const userData = await db
				.select({
					userId: user.id,
					email: user.email,
					fullname: customUser.fullname,
					phone: customUser.phone,
					college: customUser.college,
					city: customUser.city,
					year: customUser.year,
					department: customUser.department,
				})
				.from(user)
				.leftJoin(customUser, eq(user.id, customUser.userId));

			return userData;
		} catch {
			throw new Error("Failed to fetch user data");
		}
	},
);

export const UserDataHeader = [
	"User ID",
	"Email",
	"Full Name",
	"Phone",
	"College",
	"City",
	"Year",
	"Department",
];

export const getUserDataByEventId = createServerFn({ method: "GET" })
	.inputValidator(z.object({ eventId: z.number() }))
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: "ADMIN-MASTER" } });

		try {
			const userDataByEventId = await db
				.select({
					userId: user.id,
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
	"User ID",
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
		await requireAdminUser({ data: { roles: "ADMIN-MASTER" } });

		try {
			const userDataByWorkshopId = await db
				.select({
					userId: user.id,
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
	"User ID",
	"Email",
	"Full Name",
	"Phone",
	"College",
	"City",
	"Year",
	"Department",
];
