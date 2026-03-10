import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
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

const WorkshopInputSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	longDescription: z.string().min(1, "Long description is required"),
	time: z.string().min(1, "Time is required"),
	location: z.string().min(1, "Location is required"),
	price: z.string().min(1, "Price is required"),
	isDisabled: z.boolean().default(false),
});

export const createWorkshop = createServerFn({ method: "POST" })
	.inputValidator(WorkshopInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["ADMIN"] } });

		const parsedData = parseAndThrow(data, WorkshopInputSchema);

		await db.insert(workshops).values({
			title: parsedData.title,
			description: parsedData.description,
			longDescription: parsedData.longDescription,
			time: parsedData.time,
			location: parsedData.location,
			price: parsedData.price,
			isDisabled: parsedData.isDisabled,
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
		await requireAdminUser({ data: { roles: ["ADMIN"] } });

		const { id, data: workshopData } = data;
		const parsedData = parseAndThrow(workshopData, WorkshopInputSchema);

		await db
			.update(workshops)
			.set({
				title: parsedData.title,
				description: parsedData.description,
				longDescription: parsedData.longDescription,
				time: parsedData.time,
				location: parsedData.location,
				price: parsedData.price,
				isDisabled: parsedData.isDisabled,
			})
			.where(eq(workshops.id, id));
	});
