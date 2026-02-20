import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import {
	customUser,
	events,
	payments,
	registrations,
	workshops,
} from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";
import { computeHasEventPassByUserId } from "@/server/admin-reporting";

const getPaidPaymentsForEventPass = createServerOnlyFn(async () => {
	return db
		.select({
			userId: payments.userId,
			isEventPass: payments.isEventPass,
			workshopId: payments.workshopId,
		})
		.from(payments)
		.where(eq(payments.status, "paid"));
});

const getPrDataset = createServerOnlyFn(async () => {
	const users = await db.select({ id: user.id, name: user.name }).from(user);
	const profiles = await db
		.select({
			userId: customUser.userId,
			fullname: customUser.fullname,
			phone: customUser.phone,
		})
		.from(customUser);
	const allEvents = await db.select({ title: events.title }).from(events);
	const allWorkshops = await db
		.select({ id: workshops.id, title: workshops.title })
		.from(workshops);
	const paidPayments = await getPaidPaymentsForEventPass();

	const hasEventPassByUserId = computeHasEventPassByUserId(users, paidPayments);

	const profilesByUserId = new Map(
		profiles.map((profile) => [profile.userId, profile]),
	);

	const paidWorkshopIdsByUserId = new Map<string, Set<number>>();
	for (const payment of paidPayments) {
		if (payment.workshopId === null) {
			continue;
		}

		const existingWorkshopSet = paidWorkshopIdsByUserId.get(payment.userId);
		if (existingWorkshopSet) {
			existingWorkshopSet.add(payment.workshopId);
			continue;
		}

		paidWorkshopIdsByUserId.set(payment.userId, new Set([payment.workshopId]));
	}

	const eventTitles = allEvents.map((event) => event.title);
	const workshopTitles = allWorkshops.map((workshop) => workshop.title);

	const prColumns = [
		"user id",
		"user name",
		"full name",
		"phone",
		...eventTitles,
		...workshopTitles,
	] as const;

	const prRows = users.map((currentUser) => {
		const profile = profilesByUserId.get(currentUser.id);
		const hasEventPass = Boolean(hasEventPassByUserId[currentUser.id]);
		const paidWorkshopSet = paidWorkshopIdsByUserId.get(currentUser.id);

		const eventCells = allEvents.map(() => (hasEventPass ? "yes" : "no"));
		const workshopCells = allWorkshops.map((workshop) =>
			paidWorkshopSet?.has(workshop.id) ? "yes" : "no",
		);

		return [
			currentUser.id,
			currentUser.name,
			profile?.fullname ?? "",
			profile?.phone ?? "",
			...eventCells,
			...workshopCells,
		];
	});

	return {
		columns: prColumns,
		rows: prRows,
	};
});

const getMasterUsers = createServerOnlyFn(async () => {
	const users = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			onBoardingComplete: user.onBoardingComplete,
			emailVerified: user.emailVerified,
			createdAt: user.createdAt,
		})
		.from(user);
	const profiles = await db
		.select({
			userId: customUser.userId,
			fullname: customUser.fullname,
			phone: customUser.phone,
			college: customUser.college,
			city: customUser.city,
			department: customUser.department,
			year: customUser.year,
			gender: customUser.gender,
		})
		.from(customUser);
	const paidPayments = await getPaidPaymentsForEventPass();

	const hasEventPassByUserId = computeHasEventPassByUserId(users, paidPayments);
	const profilesByUserId = new Map(
		profiles.map((profile) => [profile.userId, profile]),
	);

	return users.map((authUser) => {
		const profile = profilesByUserId.get(authUser.id);
		return {
			...authUser,
			profile: profile ?? null,
			hasEventPass: Boolean(hasEventPassByUserId[authUser.id]),
		};
	});
});

const getMasterEvents = createServerOnlyFn(async () => {
	const allEvents = await db
		.select({
			id: events.id,
			title: events.title,
			location: events.location,
			time: events.time,
		})
		.from(events)
		.orderBy(asc(events.id));
	const allRegistrations = await db
		.select({ eventId: registrations.eventId })
		.from(registrations);
	const registrationCountByEventId = new Map<number, number>();

	for (const registration of allRegistrations) {
		if (registration.eventId === null) {
			continue;
		}

		const currentCount =
			registrationCountByEventId.get(registration.eventId) ?? 0;
		registrationCountByEventId.set(registration.eventId, currentCount + 1);
	}

	return allEvents.map((event) => ({
		...event,
		registrationCount: registrationCountByEventId.get(event.id) ?? 0,
	}));
});

const getMasterEventDetail = createServerOnlyFn(
	async ({ data }: { data: { eventId: number } }) => {
		const { eventId } = data;

		const [event] = await db
			.select({
				id: events.id,
				title: events.title,
				description: events.description,
			})
			.from(events)
			.where(eq(events.id, eventId));
		if (!event) {
			throw new Error("Event not found");
		}

		const users = await db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				onBoardingComplete: user.onBoardingComplete,
				emailVerified: user.emailVerified,
				createdAt: user.createdAt,
			})
			.from(user);
		const profiles = await db
			.select({
				userId: customUser.userId,
				fullname: customUser.fullname,
				phone: customUser.phone,
				college: customUser.college,
				city: customUser.city,
				department: customUser.department,
				year: customUser.year,
				gender: customUser.gender,
			})
			.from(customUser);
		const paidPayments = await getPaidPaymentsForEventPass();

		const hasEventPassByUserId = computeHasEventPassByUserId(
			users,
			paidPayments,
		);
		const profilesByUserId = new Map(
			profiles.map((profile) => [profile.userId, profile]),
		);

		const registeredUsers = users
			.filter((currentUser) => Boolean(hasEventPassByUserId[currentUser.id]))
			.map((currentUser) => ({
				...currentUser,
				profile: profilesByUserId.get(currentUser.id) ?? null,
				hasEventPass: true,
			}));

		return {
			event,
			registeredUsers,
		};
	},
);

export const getPrDatasetForPage = createServerFn({
	method: "GET",
}).handler(async () => {
	await requireAdminUser();
	return getPrDataset();
});

export const getMasterUsersForPage = createServerFn({
	method: "GET",
}).handler(async () => {
	await requireAdminUser();
	return getMasterUsers();
});

export const getMasterEventsForPage = createServerFn({
	method: "GET",
}).handler(async () => {
	await requireAdminUser();
	return getMasterEvents();
});

export const getMasterEventDetailForPage = createServerFn({
	method: "GET",
})
	.inputValidator(z.object({ eventId: z.number() }))
	.handler(async ({ data }) => {
		await requireAdminUser();
		return getMasterEventDetail({ data });
	});
