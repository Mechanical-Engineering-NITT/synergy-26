import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { events, registrations } from "@/db/schema";
import { getCurrentSession, requireOnBoardedUser } from "@/lib/utils";
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
