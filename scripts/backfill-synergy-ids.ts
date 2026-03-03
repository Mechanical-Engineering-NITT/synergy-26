import "dotenv/config";
import { eq, isNull } from "drizzle-orm";
import { db } from "../src/db";
import { customUser } from "../src/db/schema";

async function generateUniqueSynergyId(): Promise<string> {
	let attempts = 0;
	while (attempts < 100) {
		const newId = Math.floor(1000 + Math.random() * 9000).toString();
		const [existing] = await db
			.select()
			.from(customUser)
			.where(eq(customUser.synergyId, newId))
			.limit(1);

		if (!existing) {
			return newId;
		}
		attempts++;
	}
	throw new Error("Failed to generate unique Synergy ID after 100 attempts");
}

async function run() {
	console.log("Starting Synergy ID backfill...");
	const usersToUpdate = await db
		.select()
		.from(customUser)
		.where(isNull(customUser.synergyId));

	console.log(`Found ${usersToUpdate.length} users needing Synergy IDs`);

	for (const user of usersToUpdate) {
		try {
			const synergyId = await generateUniqueSynergyId();
			await db
				.update(customUser)
				.set({ synergyId })
				.where(eq(customUser.id, user.id));
			console.log(`Updated user ${user.id} with synergistic ID: ${synergyId}`);
		} catch (error) {
			console.error(`Failed to update user ${user.id}`, error);
		}
	}

	console.log("Backfill complete!");
	process.exit(0);
}

run().catch(console.error);
