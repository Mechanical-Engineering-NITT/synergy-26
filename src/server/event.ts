import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { events, registrations } from "@/db/schema";
import {
	getCurrentSession,
	parseAndThrow,
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

		await db.insert(registrations).values({
			userId: user.id,
			eventId: data.eventId,
		});

		return { success: true };
	});

const EventInputSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	time: z.iso.datetime("Time is required"),
	location: z.string().min(1, "Location is required"),
});

export const createEvent = createServerFn({ method: "POST" })
	.inputValidator(EventInputSchema)
	.handler(async ({ data }) => {
		try {
			const session = await getCurrentSession();
			if (!session || session.user?.role !== "ADMIN") {
				throw new Error("Unauthorized");
			}

			const parsedData = parseAndThrow(data, EventInputSchema);

			await db.insert(events).values({
				title: parsedData.title,
				description: parsedData.description,
				time: new Date(parsedData.time),
				location: parsedData.location,
			});
		} catch (error) {
			throw new Error(
				`Event creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}

		return { ok: true };
	});

export const updateEvent = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			id: z.number(),
			data: EventInputSchema,
		}),
	)
	.handler(async ({ data }) => {
		try {
			const session = await getCurrentSession();
			if (!session || session.user?.role !== "ADMIN") {
				throw new Error("Unauthorized");
			}

			const { id, data: eventData } = data;
			const parsedData = parseAndThrow(eventData, EventInputSchema);

			await db
				.update(events)
				.set({
					title: parsedData.title,
					description: parsedData.description,
					time: new Date(parsedData.time),
					location: parsedData.location,
				})
				.where(eq(events.id, id));
		} catch (error) {
			throw new Error(
				`Event update failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}

		return { ok: true };
	});

export const deleteEvent = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.number() }))
	.handler(async ({ data }) => {
		try {
			const session = await getCurrentSession();
			if (!session || session.user?.role !== "ADMIN") {
				throw new Error("Unauthorized");
			}

			await db.delete(events).where(eq(events.id, data.id));
		} catch (error) {
			throw new Error(
				`Event deletion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}

		return { ok: true };
	});
