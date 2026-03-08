import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { and, eq, isNotNull, or } from "drizzle-orm";
import Razorpay from "razorpay";
import * as z from "zod";
import { db } from "@/db";
import {
	onspotPayments,
	payments,
	registrations,
	workshops,
} from "@/db/schema";
import { parseAndThrow, requireOnBoardedUser } from "@/lib/utils";
import { getConstantValue } from "./constants";

let razorpayInstance: Razorpay | null = null;

const getRazorpay = createServerOnlyFn(() => {
	if (!razorpayInstance) {
		razorpayInstance = new Razorpay({
			key_id: process.env.RAZORPAY_KEY_ID ?? "",
			key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
		});
	}
	return razorpayInstance;
});

export const hasEventPass = createServerOnlyFn(async (userId: string) => {
	const [onlinePayment, onspotPayment] = await Promise.all([
		db
			.select()
			.from(payments)
			.where(
				and(
					eq(payments.userId, userId),
					eq(payments.status, "paid"),
					or(eq(payments.isEventPass, true), isNotNull(payments.workshopId)),
				),
			)
			.limit(1),
		db
			.select()
			.from(onspotPayments)
			.where(
				and(
					eq(onspotPayments.userId, userId),
					or(
						eq(onspotPayments.isEventPass, true),
						isNotNull(onspotPayments.workshopId),
					),
				),
			)
			.limit(1),
	]);

	return Boolean(onlinePayment[0] || onspotPayment[0]);
});

export const hasPaidForWorkshop = createServerOnlyFn(
	async (userId: string, workshopId: number) => {
		const [onlinePayment, onspotPayment] = await Promise.all([
			db
				.select()
				.from(payments)
				.where(
					and(
						eq(payments.userId, userId),
						eq(payments.workshopId, workshopId),
						eq(payments.status, "paid"),
					),
				)
				.limit(1),
			db
				.select()
				.from(onspotPayments)
				.where(
					and(
						eq(onspotPayments.userId, userId),
						eq(onspotPayments.workshopId, workshopId),
					),
				)
				.limit(1),
		]);

		return Boolean(onlinePayment[0] || onspotPayment[0]);
	},
);

const CreateOrderInput = z
	.object({
		amount: z.number().int().min(100), // in paise, minimum 1 rupee
		workshopId: z.number().nullable().optional(),
		isEventPass: z.boolean().optional(),
	})
	.refine(
		(data) => {
			const fields = [
				data.workshopId !== undefined && data.workshopId !== null,
				data.isEventPass === true,
			];
			const count = fields.filter(Boolean).length;
			return count === 1;
		},
		{
			message: "Exactly one of workshopId or isEventPass must be provided",
			path: ["workshopId", "isEventPass"],
		},
	);

export const createOrder = createServerFn({ method: "POST" })
	.inputValidator(CreateOrderInput)
	.handler(async ({ data }) => {
		const user = await requireOnBoardedUser();
		const userId = user.id;
		const parsedData = parseAndThrow(data, CreateOrderInput);

		// --- Existing Payment Validation ---
		if (parsedData.isEventPass) {
			const existingPass = await hasEventPass(userId);
			if (existingPass) {
				throw new Error("You already have an active event pass");
			}
		}

		if (parsedData.workshopId) {
			const existingWorkshop = await hasPaidForWorkshop(
				userId,
				parsedData.workshopId,
			);
			if (existingWorkshop) {
				throw new Error("You have already paid for this workshop");
			}
		}
		// -------------------------------

		// --- Amount Validation ---
		let expectedAmountPaise = 0;

		if (parsedData.isEventPass) {
			const eventPassPriceStr = await getConstantValue("event_pass");
			if (!eventPassPriceStr)
				throw new Error("Event pass price not configured");
			expectedAmountPaise = Number(eventPassPriceStr) * 100;
		} else if (parsedData.workshopId) {
			const [workshop] = await db
				.select()
				.from(workshops)
				.where(eq(workshops.id, parsedData.workshopId))
				.limit(1);
			if (!workshop) throw new Error("Workshop not found");
			if (workshop.isDisabled)
				throw new Error("Registration is disabled for this workshop");
			expectedAmountPaise = Number(workshop.price) * 100;
		} else {
			throw new Error("Invalid order type");
		}

		if (parsedData.amount !== expectedAmountPaise) {
			throw new Error(
				`Incorrect payment amount. Expected ${expectedAmountPaise} but got ${parsedData.amount}`,
			);
		}
		// -------------------------

		const razorpay = getRazorpay();

		const order = await razorpay.orders.create({
			amount: parsedData.amount,
			currency: "INR",
			notes: {
				userId: userId,
				workshopId: parsedData.workshopId?.toString() || "",
				isEventPass: parsedData.isEventPass?.toString() || "false",
			},
		});

		// Store order in database
		await db.insert(payments).values({
			razorpayOrderId: order.id,
			amount: parsedData.amount,
			status: "created",
			workshopId: parsedData.workshopId,
			isEventPass: parsedData.isEventPass,
			userId: userId,
		});

		return order.id;
	});

export const getRazorpayKeyId = createServerFn({ method: "GET" }).handler(
	async () => {
		const keyId = process.env.RAZORPAY_KEY_ID;
		if (!keyId) {
			throw new Error("RAZORPAY_KEY_ID not found");
		}
		return keyId;
	},
);

const VerifyPaymentInput = z.object({
	orderId: z.string().min(1),
	paymentId: z.string().min(1),
	signature: z.string().min(1),
});

export const verifyPayment = createServerFn({ method: "POST" })
	.inputValidator(VerifyPaymentInput)
	.handler(async ({ data }) => {
		const parsedData = parseAndThrow(data, VerifyPaymentInput);
		const { validatePaymentVerification } = await import(
			"razorpay/dist/utils/razorpay-utils.js"
		);

		const isValid = validatePaymentVerification(
			{
				order_id: parsedData.orderId,
				payment_id: parsedData.paymentId,
			},
			parsedData.signature,
			process.env.RAZORPAY_KEY_SECRET ?? "",
		);

		if (!isValid) {
			throw new Error("Payment verification failed");
		}

		return { verified: true, paymentId: parsedData.paymentId };
	});

const SyncOrderStatusInput = z.object({
	orderId: z.string().min(1),
});

export const syncOrderStatus = createServerFn({ method: "POST" })
	.inputValidator(SyncOrderStatusInput)
	.handler(async ({ data }) => {
		const parsedData = parseAndThrow(data, SyncOrderStatusInput);
		const razorpay = getRazorpay();

		const order = await razorpay.orders.fetch(parsedData.orderId);
		const razorpayStatus = order.status as "created" | "attempted" | "paid";

		const [localPayment] = await db
			.select()
			.from(payments)
			.where(eq(payments.razorpayOrderId, parsedData.orderId))
			.limit(1);

		if (!localPayment) {
			throw new Error("Payment not found");
		}

		if (razorpayStatus === "paid") {
			const [payment] = await db
				.update(payments)
				.set({ status: "paid", updatedAt: new Date() })
				.where(eq(payments.razorpayOrderId, parsedData.orderId))
				.returning();

			if (payment?.workshopId) {
				// Register user for workshop automatically
				await db
					.insert(registrations)
					.values({
						userId: payment.userId,
						workshopId: payment.workshopId,
					})
					.onConflictDoNothing(); // Basic idempotency
			}

			return "paid" as const;
		}

		// Check 15-min timeout for created/attempted orders
		const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
		if (
			localPayment.createdAt &&
			localPayment.createdAt < fifteenMinsAgo &&
			(localPayment.status === "created" || localPayment.status === "attempted")
		) {
			await db
				.update(payments)
				.set({ status: "failed", updatedAt: new Date() })
				.where(eq(payments.razorpayOrderId, parsedData.orderId));
			return "failed" as const;
		}

		// Update to attempted if that's the Razorpay status
		if (razorpayStatus === "attempted" && localPayment.status === "created") {
			await db
				.update(payments)
				.set({ status: "attempted", updatedAt: new Date() })
				.where(eq(payments.razorpayOrderId, parsedData.orderId));
			return "attempted" as const;
		}

		return localPayment.status;
	});

export const getUserPayments = createServerFn({ method: "GET" }).handler(
	async () => {
		const user = await requireOnBoardedUser();
		const onlinePayments = await db
			.select({
				id: payments.id,
				razorpayOrderId: payments.razorpayOrderId,
				amount: payments.amount,
				status: payments.status,
				createdAt: payments.createdAt,
				isEventPass: payments.isEventPass,
				workshopTitle: workshops.title,
			})
			.from(payments)
			.leftJoin(workshops, eq(payments.workshopId, workshops.id))
			.where(eq(payments.userId, user.id))
			.orderBy(payments.createdAt);

		const onspotUserPayments = await db
			.select({
				id: onspotPayments.id,
				amount: onspotPayments.amount,
				createdAt: onspotPayments.createdAt,
				isEventPass: onspotPayments.isEventPass,
				workshopTitle: workshops.title,
			})
			.from(onspotPayments)
			.leftJoin(workshops, eq(onspotPayments.workshopId, workshops.id))
			.where(eq(onspotPayments.userId, user.id))
			.orderBy(onspotPayments.createdAt);

		const mergedPayments = [
			...onlinePayments.map((payment) => ({
				...payment,
				source: "online" as const,
			})),
			...onspotUserPayments.map((payment) => ({
				id: payment.id,
				razorpayOrderId: `onspot-${payment.id}`,
				amount: payment.amount,
				status: "paid" as const,
				createdAt: payment.createdAt,
				isEventPass: payment.isEventPass,
				workshopTitle: payment.workshopTitle,
				source: "onspot" as const,
			})),
		].sort((leftEntry, rightEntry) => {
			const leftTime = leftEntry.createdAt
				? new Date(leftEntry.createdAt).getTime()
				: 0;
			const rightTime = rightEntry.createdAt
				? new Date(rightEntry.createdAt).getTime()
				: 0;

			return rightTime - leftTime;
		});

		return mergedPayments;
	},
);
