import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { db } from "@/db";
import { attendance } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";
import { verifyQAAttendanceEligibility } from "./utils";

const MarkAttendanceInputSchema = z.object({
	synergyId: z.string().min(4).max(4),
	type: z.enum(["event", "workshop"]),
	id: z.number().int().positive(),
});

export const markAttendance = createServerFn({ method: "POST" })
	.inputValidator(MarkAttendanceInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["QA", "MASTER", "ADMIN"] } });

		const verification = await verifyQAAttendanceEligibility({
			synergyId: data.synergyId,
			type: data.type,
			id: data.id,
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
		});

		return { success: true };
	});
