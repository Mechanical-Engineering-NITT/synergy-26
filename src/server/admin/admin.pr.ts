import { createServerFn } from "@tanstack/react-start";
import {
	and,
	count,
	countDistinct,
	desc,
	eq,
	inArray,
	isNotNull,
	sum,
} from "drizzle-orm";
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

export const getPaginatedUsers = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			page: z.number().int().min(1).default(1),
			limit: z.number().int().min(1).max(100).default(20),
		}),
	)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["ADMIN-PR", "ADMIN-MASTER"] } });

		try {
			const page = data.page;
			const limit = data.limit;
			const offset = (page - 1) * limit;

			const totalUsersResult = await db
				.select({ total: count(user.id) })
				.from(user);

			const usersPageRows = await db
				.select({
					id: user.id,
					email: user.email,
					fullname: customUser.fullname,
					phone: customUser.phone,
				})
				.from(user)
				.leftJoin(customUser, eq(customUser.userId, user.id))
				.orderBy(desc(user.createdAt))
				.limit(limit)
				.offset(offset);

			if (usersPageRows.length === 0) {
				const totalUsers = Number(totalUsersResult[0]?.total ?? 0);

				return {
					data: {
						rows: [],
						pagination: {
							page,
							limit,
							totalUsers,
							totalPages: Math.max(1, Math.ceil(totalUsers / limit)),
						},
					},
				};
			}

			const userIds = usersPageRows.map((currentUser) => currentUser.id);

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
				.where(
					and(
						inArray(registrations.userId, userIds),
						isNotNull(registrations.eventId),
						isNotNull(payments.id),
					),
				)
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
				.where(
					and(
						inArray(registrations.userId, userIds),
						isNotNull(registrations.workshopId),
						isNotNull(payments.id),
					),
				)
				.groupBy(registrations.userId);

			const paymentAggRows = await db
				.select({
					userId: payments.userId,
					totalPaidAmount: sum(payments.amount),
				})
				.from(payments)
				.where(
					and(inArray(payments.userId, userIds), eq(payments.status, "paid")),
				)
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

			const totalUsers = Number(totalUsersResult[0]?.total ?? 0);

			return {
				data: {
					rows: usersPageRows.map((currentUser) => ({
						...currentUser,
						totalEvents: eventAggMap.get(currentUser.id) ?? 0,
						totalWorkshops: workshopAggMap.get(currentUser.id) ?? 0,
						totalPaidAmount: paymentAggMap.get(currentUser.id) ?? 0,
					})),
					pagination: {
						page,
						limit,
						totalUsers,
						totalPages: Math.max(1, Math.ceil(totalUsers / limit)),
					},
				},
			};
		} catch {
			throw new Error("Failed to fetch admin users");
		}
	});

export const getPaginatedUserDetails = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			userId: z.string().min(1),
		}),
	)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["ADMIN-PR", "ADMIN-MASTER"] } });

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

			const eventRegistrations = await db
				.select({
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
						eq(payments.isEventPass, true),
					),
				)
				.where(
					and(
						eq(registrations.userId, data.userId),
						isNotNull(registrations.eventId),
						isNotNull(events.id),
						isNotNull(payments.id),
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
			throw new Error("Failed to fetch admin user details");
		}
	});
