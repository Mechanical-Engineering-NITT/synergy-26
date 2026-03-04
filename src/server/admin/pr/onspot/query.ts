import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { registrations, workshops } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";
import { getConstantValue } from "@/server/constants";

const parseCurrencyValue = (key: string, value: string | null) => {
	if (value === null) {
		throw new Error(`Missing constant value for key: ${key}`);
	}

	const parsedValue = Number(value);
	if (Number.isNaN(parsedValue) || parsedValue < 0) {
		throw new Error(`Invalid numeric constant value for key: ${key}`);
	}

	return parsedValue;
};

const parseWorkshopPrice = (workshopId: number, value: string) => {
	const parsedValue = Number(value);
	if (Number.isNaN(parsedValue) || parsedValue < 0) {
		throw new Error(
			`Invalid numeric workshop price for workshop id: ${workshopId}`,
		);
	}

	return parsedValue;
};

const OnspotSelectionInputSchema = z
	.object({
		selectedWorkshops: z.array(z.number().int().positive()).default([]),
		eventPassSelected: z.boolean().default(false),
	})
	.superRefine((data, ctx) => {
		if (data.selectedWorkshops.length > 0 && data.eventPassSelected) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Event pass cannot be selected when workshops are selected",
				path: ["eventPassSelected"],
			});
		}

		if (data.selectedWorkshops.length === 0 && !data.eventPassSelected) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Select at least one workshop or event pass",
				path: ["selectedWorkshops", "eventPassSelected"],
			});
		}
	});

const GetOnspotRegistrationOptionsInputSchema = z.object({
	userId: z.string().min(1),
});

export const getOnspotRegistrationOptions = createServerFn({ method: "GET" })
	.inputValidator(GetOnspotRegistrationOptionsInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		const [workshopRows, eventPassValue, existingWorkshopRegistrationRows] =
			await Promise.all([
				db
					.select({
						id: workshops.id,
						title: workshops.title,
						price: workshops.price,
					})
					.from(workshops),
				getConstantValue("event_pass"),
				db
					.select({ workshopId: registrations.workshopId })
					.from(registrations)
					.where(
						and(
							eq(registrations.userId, data.userId),
							isNotNull(registrations.workshopId),
						),
					),
			]);

		const existingWorkshopRegistrations = Array.from(
			new Set(
				existingWorkshopRegistrationRows
					.map((registrationEntry) => registrationEntry.workshopId)
					.filter((workshopId): workshopId is number => workshopId !== null),
			),
		).sort((leftValue, rightValue) => leftValue - rightValue);

		return {
			workshops: workshopRows.map((workshopEntry) => ({
				id: workshopEntry.id,
				title: workshopEntry.title,
				price: parseWorkshopPrice(workshopEntry.id, workshopEntry.price),
			})),
			eventPassPrice: parseCurrencyValue("event_pass", eventPassValue),
			existingWorkshopRegistrations,
		};
	});

export const calculateOnspotAmount = createServerFn({ method: "POST" })
	.inputValidator(OnspotSelectionInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		const selectedWorkshopIds = Array.from(new Set(data.selectedWorkshops));

		if (selectedWorkshopIds.length > 0) {
			const workshopRows = await db
				.select({
					id: workshops.id,
					price: workshops.price,
				})
				.from(workshops)
				.where(inArray(workshops.id, selectedWorkshopIds));

			if (workshopRows.length !== selectedWorkshopIds.length) {
				throw new Error("One or more selected workshops were not found");
			}

			const workshopPrices = workshopRows.reduce<Record<number, number>>(
				(accumulator, workshopEntry) => {
					accumulator[workshopEntry.id] = parseWorkshopPrice(
						workshopEntry.id,
						workshopEntry.price,
					);
					return accumulator;
				},
				{},
			);

			const totalAmount = selectedWorkshopIds.reduce(
				(total, workshopId) => total + (workshopPrices[workshopId] ?? 0),
				0,
			);

			return { totalAmount };
		}

		const eventPassValue = await getConstantValue("event_pass");
		const eventPassPrice = parseCurrencyValue("event_pass", eventPassValue);

		return { totalAmount: eventPassPrice };
	});
