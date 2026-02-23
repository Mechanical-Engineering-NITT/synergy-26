import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { WorkshopInputSchema } from "@/components/forms/create-workshop";
import { db } from "@/db";
import { registrations, workshops } from "@/db/schema";
import {
	getCurrentSession,
	parseAndThrow,
	requireAdminUser,
} from "@/lib/utils";

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

export const createWorkshop = createServerFn({ method: "POST" })
	.inputValidator(WorkshopInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser();

		const parsedData = parseAndThrow(data, WorkshopInputSchema);

		await db.insert(workshops).values({
			title: parsedData.title,
			description: parsedData.description,
			time: new Date(parsedData.time),
			location: parsedData.location,
			price: parsedData.price,
		});
	});

export const updateWorkshop = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			id: z.number(),
			data: WorkshopInputSchema,
		}),
	)
	.handler(async ({ data }) => {
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
	});
