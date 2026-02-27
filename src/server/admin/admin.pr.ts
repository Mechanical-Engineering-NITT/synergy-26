import { createServerFn } from "@tanstack/react-start";
import { and, countDistinct, desc, eq, isNotNull, or, sum } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import {
	customUser,
	events,
	payments,
	registrations,
	workshops,
} from "@/db/schema";
import { requireAdminUser } from "@/lib/utils";

export const getPrUsers = createServerFn({ method: "GET" }).handler(
	async () => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		try {
			const usersRows = await db
				.select({
					id: user.id,
					email: user.email,
					fullname: customUser.fullname,
					phone: customUser.phone,
				})
				.from(user)
				.leftJoin(customUser, eq(customUser.userId, user.id))
				.orderBy(desc(user.createdAt));

			if (usersRows.length === 0) {
				return {
					data: {
						rows: [],
					},
				};
			}

			const eventAggRows = await db
				.select({
					userId: registrations.userId,
					totalEvents: countDistinct(events.id),
				})
				.from(registrations)
				.leftJoin(events, eq(events.id, registrations.eventId))
				.leftJoin(
					payments,
					and(
						eq(payments.userId, registrations.userId),
						eq(payments.status, "paid"),
						eq(payments.isEventPass, true),
					),
				)
				.where(and(isNotNull(registrations.eventId), isNotNull(payments.id)))
				.groupBy(registrations.userId);

			const workshopAggRows = await db
				.select({
					userId: registrations.userId,
					totalWorkshops: countDistinct(workshops.id),
				})
				.from(registrations)
				.leftJoin(workshops, eq(workshops.id, registrations.workshopId))
				.leftJoin(
					payments,
					and(
						eq(payments.userId, registrations.userId),
						eq(payments.workshopId, registrations.workshopId),
						eq(payments.status, "paid"),
					),
				)
				.where(and(isNotNull(registrations.workshopId), isNotNull(payments.id)))
				.groupBy(registrations.userId);

			const paymentAggRows = await db
				.select({
					userId: payments.userId,
					totalPaidAmount: sum(payments.amount),
				})
				.from(payments)
				.where(eq(payments.status, "paid"))
				.groupBy(payments.userId);

			const eventAggMap = new Map(
				eventAggRows.map((entry) => [
					entry.userId,
					Number(entry.totalEvents ?? 0),
				]),
			);
			const workshopAggMap = new Map(
				workshopAggRows.map((entry) => [
					entry.userId,
					Number(entry.totalWorkshops ?? 0),
				]),
			);
			const paymentAggMap = new Map(
				paymentAggRows.map((entry) => [
					entry.userId,
					Number(entry.totalPaidAmount ?? 0),
				]),
			);

			return {
				data: {
					rows: usersRows.map((currentUser) => ({
						...currentUser,
						totalEvents: eventAggMap.get(currentUser.id) ?? 0,
						totalWorkshops: workshopAggMap.get(currentUser.id) ?? 0,
						totalPaidAmount: paymentAggMap.get(currentUser.id) ?? 0,
					})),
				},
			};
		} catch {
			throw new Error("Failed to fetch users");
		}
	},
);

export const getPrUserDetails = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			userId: z.string().min(1),
		}),
	)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		try {
			const profileRows = await db
				.select({
					id: user.id,
					email: user.email,
					fullname: customUser.fullname,
					phone: customUser.phone,
				})
				.from(user)
				.leftJoin(customUser, eq(customUser.userId, user.id))
				.where(eq(user.id, data.userId))
				.limit(1);

			if (!profileRows[0]) {
				throw new Error("User not found");
			}

			// Events: User must have registered for the specific event AND have paid for either:
			// 1. An event pass (isEventPass = true), OR
			// 2. Any workshop
			const eventRegistrations = await db
				.selectDistinct({
					eventId: events.id,
					eventTitle: events.title,
					paymentStatus: payments.status,
					createdAt: registrations.createdAt,
				})
				.from(registrations)
				.leftJoin(events, eq(events.id, registrations.eventId))
				.leftJoin(
					payments,
					and(
						eq(payments.userId, registrations.userId),
						eq(payments.status, "paid"),
						or(eq(payments.isEventPass, true), isNotNull(payments.workshopId)),
					),
				)
				.where(
					and(
						eq(registrations.userId, data.userId),
						isNotNull(registrations.eventId), // Must have registered for this specific event
						isNotNull(events.id), // Event must exist
						isNotNull(payments.id), // Must have paid for event pass OR workshop
					),
				)
				.orderBy(desc(registrations.createdAt));

			const workshopRegistrations = await db
				.select({
					workshopId: workshops.id,
					workshopTitle: workshops.title,
					paymentStatus: payments.status,
					createdAt: registrations.createdAt,
				})
				.from(registrations)
				.leftJoin(workshops, eq(workshops.id, registrations.workshopId))
				.leftJoin(
					payments,
					and(
						eq(payments.userId, registrations.userId),
						eq(payments.workshopId, registrations.workshopId),
						eq(payments.status, "paid"),
					),
				)
				.where(
					and(
						eq(registrations.userId, data.userId),
						isNotNull(registrations.workshopId),
						isNotNull(workshops.id),
						isNotNull(payments.id),
					),
				)
				.orderBy(desc(registrations.createdAt));

			const paymentRows = await db
				.select({
					id: payments.id,
					amount: payments.amount,
					status: payments.status,
					createdAt: payments.createdAt,
				})
				.from(payments)
				.where(eq(payments.userId, data.userId))
				.orderBy(desc(payments.createdAt));

			return {
				data: {
					profile: profileRows[0],
					events: eventRegistrations,
					workshops: workshopRegistrations,
					payments: paymentRows,
				},
			};
		} catch {
			throw new Error("Failed to fetch user details");
		}
	});
