import { createServerFn } from "@tanstack/react-start";
import { and, countDistinct, desc, eq, isNotNull, sum } from "drizzle-orm";
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
					synergyId: customUser.synergyId,
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
				.where(and(isNotNull(registrations.eventId), isNotNull(events.id)))
				.groupBy(registrations.userId);

			const workshopAggRows = await db
				.select({
					userId: registrations.userId,
					totalWorkshops: countDistinct(workshops.id),
				})
				.from(registrations)
				.leftJoin(workshops, eq(workshops.id, registrations.workshopId))
				.where(
					and(isNotNull(registrations.workshopId), isNotNull(workshops.id)),
				)
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
						id: currentUser.id,
						email: currentUser.email,
						synergyId: currentUser.synergyId,
						fullname: currentUser.fullname,
						phone: currentUser.phone,
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
					synergyId: customUser.synergyId,
					fullname: customUser.fullname,
					phone: customUser.phone,
					collegeName: customUser.college,
					year: customUser.year,
					department: customUser.department,
				})
				.from(user)
				.leftJoin(customUser, eq(customUser.userId, user.id))
				.where(eq(user.id, data.userId))
				.limit(1);

			if (!profileRows[0]) {
				throw new Error("User not found");
			}

			const eventRegistrations = await db
				.selectDistinct({
					id: events.id,
					title: events.title,
				})
				.from(registrations)
				.leftJoin(events, eq(events.id, registrations.eventId))
				.where(
					and(
						eq(registrations.userId, data.userId),
						isNotNull(registrations.eventId),
						isNotNull(events.id),
					),
				)
				.then((rows) =>
					rows.map((entry) => ({
						id: entry.id,
						title: entry.title,
						isRegistered: true,
					})),
				);

			const workshopRegistrations = await db
				.selectDistinct({
					id: workshops.id,
					title: workshops.title,
				})
				.from(registrations)
				.leftJoin(workshops, eq(workshops.id, registrations.workshopId))
				.where(
					and(
						eq(registrations.userId, data.userId),
						isNotNull(registrations.workshopId),
						isNotNull(workshops.id),
					),
				)
				.then((rows) =>
					rows.map((entry) => ({
						id: entry.id,
						title: entry.title,
						isRegistered: true,
					})),
				);

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
