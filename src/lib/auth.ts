import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { db } from "@/db";
import { createUserOnce } from "@/server/registration";

export const auth = betterAuth({
	user: {
		additionalFields: {
			onBoardingComplete: {
				type: "boolean",
				defaultValue: false,
				input: false,
			},
		},
	},
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			if (ctx.path.includes("/callback") && ctx.context.newSession) {
				const { user } = ctx.context.newSession;
				const existingUser = await createUserOnce({
					data: { userId: user.id, name: user.name },
				});
				if (!existingUser) {
					throw new Error(
						"Failed to create or fetch user after authentication",
					);
				} else {
					if (!user.onBoardingComplete) {
						ctx.redirect("/register");
					} else {
						return true;
					}
				}
			}
		}),
	},
});
