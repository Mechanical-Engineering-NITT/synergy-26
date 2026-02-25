import { redirect } from "@tanstack/react-router";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { type ClassValue, clsx } from "clsx";
import { eq } from "drizzle-orm";
import { twMerge } from "tailwind-merge";
import type { ZodType } from "zod";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { auth } from "@/lib/auth";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getCurrentSession = createServerFn({ method: "GET" }).handler(
	async () => {
		const headers = getRequestHeaders();
		const response = await auth.api.getSession({ headers });
		return response;
	},
);

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

export const requireAdminUser = createServerOnlyFn(
	async (
		roles: "ADMIN-PR" | "ADMIN-MASTER" | Array<"ADMIN-PR" | "ADMIN-MASTER">,
	) => {
		const session = await getCurrentSession();
		if (!session) {
			throw redirect({
				to: "/",
			});
		}
		const allowedRoles = Array.isArray(roles) ? roles : [roles];
		if (allowedRoles.length === 0) {
			throw new Error("At least one role must be specified");
		}
		const [dbUser] = await db
			.select({
				id: user.id,
				role: user.role,
			})
			.from(user)
			.where(eq(user.id, session.user.id))
			.limit(1);
		if (!dbUser) {
			throw redirect({
				to: "/",
			});
		}
		const role = dbUser.role;
		const isAdminRole = role === "ADMIN-PR" || role === "ADMIN-MASTER";

		if (!role || !isAdminRole || !allowedRoles.includes(role)) {
			throw redirect({
				to: "/",
			});
		}

		return session.user;
	},
);

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
