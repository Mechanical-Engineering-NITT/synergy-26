import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { onspotPayments, registrations, workshops } from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";
import { getConstantValue } from "@/server/constants";
import { hasEventPass } from "@/server/razorpay";

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

const CompleteOnspotRegistrationInputSchema = z
	.object({
		userId: z.string().min(1),
		selectedWorkshops: z.array(z.number().int().positive()).default([]),
		eventPassSelected: z.boolean().default(false),
		paymentVerified: z.boolean(),
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

export const completeOnspotRegistration = createServerFn({ method: "POST" })
	.inputValidator(CompleteOnspotRegistrationInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		if (!data.paymentVerified) {
			throw new Error("Payment must be verified before confirmation");
		}

		const selectedWorkshopIds = Array.from(new Set(data.selectedWorkshops));

		if (data.eventPassSelected) {
			const userAlreadyHasEventPass = await hasEventPass(data.userId);
			if (userAlreadyHasEventPass) {
				throw new Error("User already has event pass eligibility");
			}
		}

		const workshopRows =
			selectedWorkshopIds.length > 0
				? await db
						.select({
							id: workshops.id,
							title: workshops.title,
							price: workshops.price,
						})
						.from(workshops)
						.where(inArray(workshops.id, selectedWorkshopIds))
				: [];

		if (workshopRows.length !== selectedWorkshopIds.length) {
			throw new Error("One or more selected workshops were not found");
		}

		const workshopPriceMap = new Map<number, number>(
			workshopRows.map((workshopEntry) => [
				workshopEntry.id,
				parseWorkshopPrice(workshopEntry.id, workshopEntry.price),
			]),
		);
		const workshopTitleMap = new Map<number, string>(
			workshopRows.map((workshopEntry) => [
				workshopEntry.id,
				workshopEntry.title,
			]),
		);

		const eventPassPrice = data.eventPassSelected
			? parseCurrencyValue("event_pass", await getConstantValue("event_pass"))
			: 0;

		return db.transaction(async (transaction) => {
			const existingWorkshopRegistrationRows =
				selectedWorkshopIds.length > 0
					? await transaction
							.select({ workshopId: registrations.workshopId })
							.from(registrations)
							.where(
								and(
									eq(registrations.userId, data.userId),
									isNotNull(registrations.workshopId),
									inArray(registrations.workshopId, selectedWorkshopIds),
								),
							)
					: [];

			const existingWorkshopIds = new Set<number>(
				existingWorkshopRegistrationRows
					.map((registrationEntry) => registrationEntry.workshopId)
					.filter((workshopId): workshopId is number => workshopId !== null),
			);

			const insertedWorkshopIds: number[] = [];
			const skippedWorkshopIds: number[] = [];
			const insertedWorkshopTitles: string[] = [];
			let totalAmount = 0;

			for (const workshopId of selectedWorkshopIds) {
				if (existingWorkshopIds.has(workshopId)) {
					skippedWorkshopIds.push(workshopId);
					continue;
				}

				const workshopPrice = workshopPriceMap.get(workshopId);
				if (workshopPrice === undefined) {
					throw new Error(
						`Workshop price missing for workshop id: ${workshopId}`,
					);
				}

				await transaction.insert(onspotPayments).values({
					amount: workshopPrice,
					userId: data.userId,
					workshopId,
					isEventPass: false,
				});

				await transaction.insert(registrations).values({
					userId: data.userId,
					workshopId,
				});

				insertedWorkshopIds.push(workshopId);
				insertedWorkshopTitles.push(workshopTitleMap.get(workshopId) ?? "");
				totalAmount += workshopPrice;
			}

			if (data.eventPassSelected) {
				await transaction.insert(onspotPayments).values({
					amount: eventPassPrice,
					userId: data.userId,
					workshopId: null,
					isEventPass: true,
				});

				totalAmount += eventPassPrice;
			}

			return {
				insertedWorkshopIds,
				insertedWorkshopTitles,
				skippedWorkshopIds,
				eventPassSelected: data.eventPassSelected,
				totalAmount,
			};
		});
	});
