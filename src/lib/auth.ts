import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DEFAULT_ROLE, ROLE_VALUES } from "@/constants/roles";
import { db } from "@/db";

export const auth = betterAuth({
	user: {
		additionalFields: {
			onBoardingComplete: {
				type: "boolean",
				defaultValue: false,
				input: false,
			},
			role: {
				type: [...ROLE_VALUES],
				required: true,
				defaultValue: DEFAULT_ROLE,
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
});
