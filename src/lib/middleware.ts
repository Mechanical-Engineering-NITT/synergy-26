import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getCurrentSession } from "./utils";

// Not needed to export?
export const userMiddleware = createMiddleware().server(async ({ next }) => {
	const session = await getCurrentSession();
	const user = session?.user;

	return next({
		context: {
			session: session?.session ?? null,
			user: user ?? null,
		},
	});
});

// one to enforce user authentication
export const userRequiredMiddleware = createMiddleware()
	.middleware([userMiddleware])
	.server(async ({ next, context }) => {
		if (!context.user) {
			throw new Error("User is not authenticated");
		}
		return next({
			context: {
				session: context.session,
				user: context.user,
			},
		});
	});

// other to enforce onboarding for logged in users
export const enforceOnBoardingIfLoggedInMiddleware = createMiddleware()
	.middleware([userMiddleware])
	.server(async ({ next, context }) => {
		if (context.user && !context.user.onBoardingComplete) {
			throw redirect({
				to: "/register",
			});
		}
		return next({
			context: {
				session: context.session,
				user: context.user,
			},
		});
	});
