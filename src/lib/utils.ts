import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { auth } from "@/lib/auth";
import { redirect } from "@tanstack/react-router";
import { ZodType } from "zod";
import { db } from "@/db";
import { events, workshops } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getCurrentSession = createServerFn().handler(async () => {
	const headers = getRequestHeaders();
	const response = await auth.api.getSession({ headers });
	return response;
});

export const enforceOnboarding = async () => {
	const session = await getCurrentSession();
	if (session && !session.user.onBoardingComplete) {
		throw redirect({
			to: "/register",
		});
	}
	return session;
};

export const requireOnBoardedUser = async () => {
	const session = await getCurrentSession();
	if (!session) {
		throw redirect({
			to: "/",
		});
	}
	if (!session.user.onBoardingComplete) {
		throw redirect({
			to: "/register",
		});
	}
	return session.user;
};

export function parseAndThrow<T>(data: T, schema: ZodType<T>) {
	const parsedData = schema.safeParse(data);
	if (!parsedData.success) {
		const errorMessage = parsedData.error.issues
			.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
			.join(", ");
		throw new Error(`Invalid input data: ${errorMessage}`);
	}
	return parsedData.data;
}

export const getAllEvents = createServerFn().handler(async () => {
	const eventInfo: InferSelectModel<typeof events>[] = [];
	await db.transaction(async (tx) => {
		const allEvents = await tx.select().from(events);
		eventInfo.push(...allEvents);
	});
	return eventInfo;
});

export const getAllWorkshops = createServerFn().handler(async () => {
	const workshopInfo: InferSelectModel<typeof workshops>[] = [];
	await db.transaction(async (tx) => {
		const allWorkshops = await tx.select().from(workshops);
		workshopInfo.push(...allWorkshops);
	});
	return workshopInfo;
});
