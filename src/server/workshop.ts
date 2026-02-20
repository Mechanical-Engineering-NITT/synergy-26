import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { WorkshopInputSchema } from "@/components/forms/create-workshop";
import { db } from "@/db";
import { registrations, workshops } from "@/db/schema";
import {
	getCurrentSession,
	parseAndThrow,
	requireAdminUser,
	requireOnBoardedUser,
} from "@/lib/utils";
import { hasPaidForWorkshop } from "./razorpay";

export const getAllWorkshops = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getCurrentSession();
		const allWorkshops = await db.select().from(workshops);

		if (!session) {
			return allWorkshops.map((workshop) => ({
				...workshop,
				isRegistered: false,
			}));
		}

		const userRegistrations = await db
			.select()
			.from(registrations)
			.where(eq(registrations.userId, session.user.id));

		const workshopIds = new Set(
			userRegistrations.map((r) => r.workshopId).filter(Boolean),
		);

		return allWorkshops.map((workshop) => ({
			...workshop,
			isRegistered: workshopIds.has(workshop.id),
		}));
	},
);

export const registerForWorkshop = createServerFn({ method: "POST" })
	.inputValidator(z.object({ workshopId: z.number() }))
	.handler(async ({ data }) => {
		const user = await requireOnBoardedUser();

		const isPaid = await hasPaidForWorkshop(user.id, data.workshopId);
		if (!isPaid) {
			throw new Error("You must pay for this workshop before registering");
		}

		const existing = await db
			.select()
			.from(registrations)
			.where(
				and(
					eq(registrations.userId, user.id),
					eq(registrations.workshopId, data.workshopId),
				),
			);

		if (existing.length > 0) {
			throw new Error("Already registered for this workshop");
		}

		await db.insert(registrations).values({
			userId: user.id,
			workshopId: data.workshopId,
		});

		return { success: true };
	});

export const createWorkshop = createServerFn({ method: "POST" })
	.inputValidator(WorkshopInputSchema)
	.handler(async ({ data }) => {
		try {
			await requireAdminUser();

			const parsedData = parseAndThrow(data, WorkshopInputSchema);

			await db.insert(workshops).values({
				title: parsedData.title,
				description: parsedData.description,
				time: new Date(parsedData.time),
				location: parsedData.location,
				price: parsedData.price,
			});
		} catch (error) {
			throw new Error(
				`Workshop creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}

		return { ok: true };
	});

export const updateWorkshop = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			id: z.number(),
			data: WorkshopInputSchema,
		}),
	)
	.handler(async ({ data }) => {
		try {
			await requireAdminUser();

			const { id, data: workshopData } = data;
			const parsedData = parseAndThrow(workshopData, WorkshopInputSchema);

			await db
				.update(workshops)
				.set({
					title: parsedData.title,
					description: parsedData.description,
					time: new Date(parsedData.time),
					location: parsedData.location,
					price: parsedData.price,
				})
				.where(eq(workshops.id, id));
		} catch (error) {
			throw new Error(
				`Workshop update failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}

		return { ok: true };
	});

export const deleteWorkshop = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.number() }))
	.handler(async ({ data }) => {
		try {
			await requireAdminUser();

			await db.delete(workshops).where(eq(workshops.id, data.id));
		} catch (error) {
			throw new Error(
				`Workshop deletion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}

		return { ok: true };
	});
