import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { type ClassValue, clsx } from "clsx";
import { eq } from "drizzle-orm";
import { twMerge } from "tailwind-merge";
import { type ZodType, z } from "zod";
import { ADMIN_ROLE_VALUES } from "@/constants/roles";
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

const adminRoleSchema = z.enum(ADMIN_ROLE_VALUES);
const requireAdminUserInputSchema = z.object({
	roles: z.union([adminRoleSchema, z.array(adminRoleSchema).nonempty()]),
});

export const requireAdminUser = createServerFn({ method: "GET" })
	.inputValidator(requireAdminUserInputSchema)
	.handler(async ({ data }) => {
		const validatedData = parseAndThrow(data, requireAdminUserInputSchema);
		const session = await getCurrentSession();
		if (!session) {
			throw redirect({
				to: "/",
			});
		}
		const allowedRoles = Array.isArray(validatedData.roles)
			? validatedData.roles
			: [validatedData.roles];
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
		const isAdminRole = role === "PR" || role === "MASTER" || role === "ADMIN";

		if (!role || !isAdminRole || !allowedRoles.includes(role)) {
			throw redirect({
				to: "/",
			});
		}

		return session.user;
	});

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
