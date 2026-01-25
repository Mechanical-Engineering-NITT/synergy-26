import crypto from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { payments } from "@/db/schema";

export const Route = createFileRoute("/api/razorpay/")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = await request.text();
				const signature = request.headers.get("x-razorpay-signature") ?? "";
				const eventId = request.headers.get("x-razorpay-event-id") ?? "";

				const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
				if (!secret) {
					console.error("RAZORPAY_WEBHOOK_SECRET not configured");
					return new Response("Server configuration error", { status: 500 });
				}

				if (!validateWebhookSignature(body, signature, secret)) {
					console.warn("Invalid webhook signature");
					return new Response("Invalid signature", { status: 401 });
				}

				if (eventId && (await isEventProcessed(eventId))) {
					console.log(`Event ${eventId} already processed`);
					return new Response("Already processed", { status: 200 });
				}

				try {
					const event = JSON.parse(body);
					console.log(`Processing webhook event: ${event.event}`);

					switch (event.event) {
						case "order.paid":
							await handleOrderPaid(event.payload, eventId);
							break;
						case "payment.failed":
							await handlePaymentFailed(event.payload, eventId);
							break;
						default:
							console.log(`Unhandled event type: ${event.event}`);
					}

					return new Response("OK", { status: 200 });
				} catch (error) {
					console.error("Error processing webhook:", error);
					return new Response("Processing error", { status: 500 });
				}
			},
		},
	},
});

function validateWebhookSignature(
	body: string,
	signature: string,
	secret: string,
): boolean {
	const expected = crypto
		.createHmac("sha256", secret)
		.update(body)
		.digest("hex");
	try {
		return crypto.timingSafeEqual(
			Buffer.from(signature),
			Buffer.from(expected),
		);
	} catch {
		return false;
	}
}

interface OrderPaidPayload {
	order: { entity: { id: string } };
	payment: { entity: { id: string } };
}

async function handleOrderPaid(payload: OrderPaidPayload, eventId: string) {
	const orderId = payload.order.entity.id;
	const paymentId = payload.payment.entity.id;

	await db
		.update(payments)
		.set({
			status: "paid",
			razorpayPaymentId: paymentId,
			webhookEventId: eventId,
			updatedAt: new Date(),
		})
		.where(eq(payments.razorpayOrderId, orderId));
}

interface PaymentFailedPayload {
	payment: {
		entity: {
			order_id: string;
		};
	};
}

async function handlePaymentFailed(
	payload: PaymentFailedPayload,
	eventId: string,
) {
	const orderId = payload.payment.entity.order_id;

	await db
		.update(payments)
		.set({
			status: "failed",
			webhookEventId: eventId,
			updatedAt: new Date(),
		})
		.where(eq(payments.razorpayOrderId, orderId));
}

async function isEventProcessed(eventId: string) {
	const existing = await db
		.select()
		.from(payments)
		.where(eq(payments.webhookEventId, eventId))
		.limit(1);
	return existing.length > 0;
}
