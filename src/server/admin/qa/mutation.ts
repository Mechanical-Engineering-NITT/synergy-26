import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { db } from "@/db";
import { attendance, sessions } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";
import { verifyQAAttendanceEligibility } from "./utils";

const MarkAttendanceInputSchema = z.object({
	synergyId: z.string().min(4).max(4),
	type: z.enum(["event", "workshop"]),
	id: z.number().int().positive(),
	sessionId: z.number().int().positive().nullable().optional(),
});

export const markAttendance = createServerFn({ method: "POST" })
	.inputValidator(MarkAttendanceInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["QA", "MASTER", "ADMIN"] } });

		const verification = await verifyQAAttendanceEligibility({
			synergyId: data.synergyId,
			type: data.type,
			id: data.id,
			sessionId: data.sessionId,
		});

		if (!verification.success) {
			throw new Error(verification.message);
		}

		// Mark Attendance
		await db.insert(attendance).values({
			userId: verification.user.userId,
			...(data.type === "event"
				? { eventId: data.id }
				: { workshopId: data.id }),
			...(data.sessionId != null ? { sessionId: data.sessionId } : {}),
		});

		return { success: true };
	});

const CreateSessionInputSchema = z.object({
	type: z.enum(["event", "workshop"]),
	id: z.number().int().positive(),
	name: z.string().min(1).max(100),
});

export const createSession = createServerFn({ method: "POST" })
	.inputValidator(CreateSessionInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["QA", "MASTER", "ADMIN"] } });

		const [newSession] = await db
			.insert(sessions)
			.values({
				name: data.name,
				...(data.type === "event"
					? { eventId: data.id }
					: { workshopId: data.id }),
			})
			.returning();

		return newSession;
	});
