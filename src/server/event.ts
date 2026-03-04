import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { events, registrations } from "@/db/schema";
import {
	getCurrentSession,
	parseAndThrow,
	requireAdminUser,
	requireOnBoardedUser,
} from "@/lib/utils";
import { hasEventPass } from "./razorpay";

export const getAllEvents = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getCurrentSession();
		const allEvents = await db.select().from(events);

		if (!session) {
			return {
				events: allEvents.map((event) => ({ ...event, isRegistered: false })),
				hasEventPass: false,
			};
		}

		const userRegistrations = await db
			.select()
			.from(registrations)
			.where(eq(registrations.userId, session.user.id));

		const eventIds = new Set(
			userRegistrations.map((r) => r.eventId).filter(Boolean),
		);

		const userHasPass = await hasEventPass(session.user.id);

		return {
			events: allEvents.map((event) => ({
				...event,
				isRegistered: eventIds.has(event.id),
			})),
			hasEventPass: userHasPass,
		};
	},
);

export const registerForEvent = createServerFn({ method: "POST" })
	.inputValidator(z.object({ eventId: z.number() }))
	.handler(async ({ data }) => {
		const user = await requireOnBoardedUser();

		const event = await db.query.events.findFirst({
			where: eq(events.id, data.eventId),
		});

		if (!event) {
			throw new Error("Event not found");
		}

		if (event.isDisabled) {
			throw new Error("Registration is disabled for this event");
		}

		const userHasPass = await hasEventPass(user.id);
		if (!userHasPass) {
			throw new Error("Event pass required to register for events");
		}

		const existing = await db
			.select()
			.from(registrations)
			.where(
				and(
					eq(registrations.userId, user.id),
					eq(registrations.eventId, data.eventId),
				),
			);

		if (existing.length > 0) {
			throw new Error("Already registered for this event");
		}

		if (event.limit !== null) {
			const currentRegistrations = await db
				.select()
				.from(registrations)
				.where(eq(registrations.eventId, data.eventId));

			const count = currentRegistrations.length;

			if (count >= event.limit) {
				await db
					.update(events)
					.set({ isDisabled: true })
					.where(eq(events.id, data.eventId));
				throw new Error("Registration limit reached for this event");
			}

			if (count + 1 === event.limit) {
				await db
					.update(events)
					.set({ isDisabled: true })
					.where(eq(events.id, data.eventId));
			}
		}

		await db.insert(registrations).values({
			userId: user.id,
			eventId: data.eventId,
		});
	});

export const registerForPreFestWorkshop = createServerFn({
	method: "POST",
}).handler(async () => {
	const user = await requireOnBoardedUser();
	// hard coded specific pre-fest event
	const eventId = 8;

	const event = await db.query.events.findFirst({
		where: eq(events.id, eventId),
	});

	if (event?.isDisabled) {
		throw new Error("Registration is disabled for this event");
	}

	const existing = await db
		.select()
		.from(registrations)
		.where(
			and(
				eq(registrations.userId, user.id),
				eq(registrations.eventId, eventId),
			),
		);

	if (existing.length > 0) {
		throw new Error("Already registered for this event");
	}

	if (event && event.limit !== null) {
		const currentRegistrations = await db
			.select()
			.from(registrations)
			.where(eq(registrations.eventId, eventId));

		const count = currentRegistrations.length;

		if (count >= event.limit) {
			await db
				.update(events)
				.set({ isDisabled: true })
				.where(eq(events.id, eventId));
			throw new Error("Registration limit reached for this event");
		}

		if (count + 1 === event.limit) {
			await db
				.update(events)
				.set({ isDisabled: true })
				.where(eq(events.id, eventId));
		}
	}

	await db.insert(registrations).values({
		userId: user.id,
		eventId: eventId,
	});
});

export const getPreFestRegistrationStatus = createServerFn({
	method: "GET",
}).handler(async () => {
	const session = await getCurrentSession();
	if (!session) return { isRegistered: false };

	// hard coded specific pre-fest event
	const eventId = 8;

	const existing = await db
		.select()
		.from(registrations)
		.where(
			and(
				eq(registrations.userId, session.user.id),
				eq(registrations.eventId, eventId),
			),
		);

	return { isRegistered: existing.length > 0 };
});

const EventInputSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	longDescription: z.string().min(1, "Long description is required"),
	time: z.string().min(1, "Time is required"),
	location: z.string().min(1, "Location is required"),
	isDisabled: z.boolean().default(false),
	limit: z.number().nullable().optional(),
});

export const createEvent = createServerFn({ method: "POST" })
	.inputValidator(EventInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["ADMIN"] } });

		const parsedData = parseAndThrow(data, EventInputSchema);

		await db.insert(events).values({
			title: parsedData.title,
			description: parsedData.description,
			longDescription: parsedData.longDescription,
			time: parsedData.time,
			location: parsedData.location,
			isDisabled: parsedData.isDisabled,
			limit: parsedData.limit,
		});
	});

export const updateEvent = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			id: z.number(),
			data: EventInputSchema,
		}),
	)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["ADMIN"] } });

		const { id, data: eventData } = data;
		const parsedData = parseAndThrow(eventData, EventInputSchema);

		await db
			.update(events)
			.set({
				title: parsedData.title,
				description: parsedData.description,
				longDescription: parsedData.longDescription,
				time: parsedData.time,
				location: parsedData.location,
				isDisabled: parsedData.isDisabled,
				limit: parsedData.limit,
			})
			.where(eq(events.id, id));
	});
