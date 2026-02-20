import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
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

export const getAdminReportingData = createServerOnlyFn(async () => {
	const users = await db.select().from(user);
	const profiles = await db.select().from(customUser);
	const allEvents = await db.select().from(events);
	const allWorkshops = await db.select().from(workshops);
	const allRegistrations = await db.select().from(registrations);
	const paidPayments = await db
		.select()
		.from(payments)
		.where(eq(payments.status, "paid"));

	const hasEventPassByUserId = Object.fromEntries(
		users.map((currentUser) => {
			const hasEventPass = paidPayments.some(
				(payment) =>
					payment.userId === currentUser.id &&
					(payment.isEventPass === true || payment.workshopId !== null),
			);

			return [currentUser.id, hasEventPass];
		}),
	);

	const profilesByUserId = new Map(
		profiles.map((profile) => [profile.userId, profile]),
	);

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
		const userRegistrations = allRegistrations.filter(
			(registration) => registration.userId === currentUser.id,
		);

		const eventRegistrationSet = new Set(
			userRegistrations
				.map((registration) => registration.eventId)
				.filter((eventId): eventId is number => eventId !== null),
		);

		const workshopRegistrationSet = new Set(
			userRegistrations
				.map((registration) => registration.workshopId)
				.filter((workshopId): workshopId is number => workshopId !== null),
		);

		const eventCells = allEvents.map((event) =>
			eventRegistrationSet.has(event.id),
		);
		const workshopCells = allWorkshops.map((workshop) =>
			workshopRegistrationSet.has(workshop.id),
		);

		return [
			currentUser.id,
			currentUser.name,
			profile?.fullname ?? "",
			profile?.phone ?? "",
			...eventCells,
			...workshopCells,
		] as const;
	});

	return {
		users,
		profiles,
		events: allEvents,
		workshops: allWorkshops,
		registrations: allRegistrations,
		paidPayments,
		hasEventPassByUserId,
		prDataset: {
			columns: prColumns,
			rows: prRows,
		},
	};
});

export const getAdminReportingDataForPages = createServerFn({
	method: "GET",
}).handler(async () => {
	await requireAdminUser();
	return getAdminReportingData();
});
