import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { attendance, customUser, events, workshops } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";
import { verifyQAAttendanceEligibility } from "./utils";

export const getQAEventsWorkshops = createServerFn({ method: "GET" }).handler(
	async () => {
		await requireAdminUser({ data: { roles: ["QA", "MASTER", "ADMIN"] } });

		const eventsData = await db.select().from(events);
		const workshopsData = await db.select().from(workshops);

		return { events: eventsData, workshops: workshopsData };
	},
);

const GetQAAttendanceInputSchema = z.object({
	type: z.enum(["event", "workshop"]),
	id: z.number().int().positive(),
});

export const getQAAttendance = createServerFn({ method: "GET" })
	.inputValidator(GetQAAttendanceInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["QA", "MASTER", "ADMIN"] } });

		const attendanceData = await db
			.select({
				id: attendance.id,
				userId: user.id,
				name: user.name,
				email: user.email,
				synergyId: customUser.synergyId,
				createdAt: attendance.createdAt,
			})
			.from(attendance)
			.innerJoin(user, eq(attendance.userId, user.id))
			.innerJoin(customUser, eq(user.id, customUser.userId))
			.where(
				data.type === "event"
					? eq(attendance.eventId, data.id)
					: eq(attendance.workshopId, data.id),
			)
			.orderBy(attendance.createdAt);

		return attendanceData;
	});

const VerifyUserAttendanceInputSchema = z.object({
	synergyId: z.string().min(4).max(4),
	type: z.enum(["event", "workshop"]),
	id: z.number().int().positive(),
});

export const verifyUserForAttendance = createServerFn({ method: "GET" })
	.inputValidator(VerifyUserAttendanceInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["QA", "MASTER", "ADMIN"] } });

		return verifyQAAttendanceEligibility({
			synergyId: data.synergyId,
			type: data.type,
			id: data.id,
		});
	});
