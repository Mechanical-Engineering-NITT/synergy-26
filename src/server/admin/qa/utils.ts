import { createServerOnlyFn } from "@tanstack/react-start";
import { and, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import {
	accommodation,
	attendance,
	customUser,
	registrations,
} from "@/db/schema";

export const verifyQAAttendanceEligibility = createServerOnlyFn(
	async ({
		synergyId,
		type,
		id,
		sessionId,
	}: {
		synergyId: string;
		type: "event" | "workshop";
		id: number;
		sessionId?: number | null;
	}) => {
		const [userRecord] = await db
			.select({
				userId: customUser.userId,
				name: user.name,
			})
			.from(customUser)
			.innerJoin(user, eq(customUser.userId, user.id))
			.where(ilike(customUser.synergyId, synergyId))
			.limit(1);

		if (!userRecord) {
			return {
				success: false as const,
				user: null,
				message: "User not found with this Synergy ID",
			};
		}

		// Check registration
		const [registration] = await db
			.select()
			.from(registrations)
			.where(
				and(
					eq(registrations.userId, userRecord.userId),
					type === "event"
						? eq(registrations.eventId, id)
						: eq(registrations.workshopId, id),
				),
			)
			.limit(1);

		if (!registration) {
			return {
				success: false as const,
				user: null,
				message: `User is not registered for this ${type}`,
			};
		}

		// Check PR Check-in
		const [prCheckin] = await db
			.select({ checkedInAt: accommodation.checkedInAt })
			.from(accommodation)
			.where(eq(accommodation.userId, userRecord.userId))
			.limit(1);

		if (!prCheckin || !prCheckin.checkedInAt) {
			return {
				success: false as const,
				user: null,
				message: "User has not completed PR check-in",
			};
		}

		// Check duplicate attendance
		// If a sessionId is provided, uniqueness is per-session.
		// Otherwise fall back to per-event/workshop duplicate check.
		const [existingAttendance] = await db
			.select()
			.from(attendance)
			.where(
				sessionId != null
					? and(
							eq(attendance.userId, userRecord.userId),
							eq(attendance.sessionId, sessionId),
						)
					: and(
							eq(attendance.userId, userRecord.userId),
							type === "event"
								? eq(attendance.eventId, id)
								: eq(attendance.workshopId, id),
						),
			)
			.limit(1);

		if (existingAttendance) {
			return {
				success: false as const,
				user: null,
				message:
					sessionId != null
						? "User is already marked as attended for this session"
						: "User is already marked as attended",
			};
		}

		return {
			success: true as const,
			user: {
				userId: userRecord.userId,
				name: userRecord.name,
			},
		};
	},
);
