import { createFileRoute } from "@tanstack/react-router";
import Sample from "@/components/Sample";
import { authClient } from "@/lib/auth-client";
import { enforceOnboarding } from "@/lib/utils";
import EventsTest from "@/components/events/test-events";
import WorkshopsTest from "@/components/events/test-workshops";

export const Route = createFileRoute("/")({
	component: App,
	loader: async () => {
		const session = await enforceOnboarding();
		return session;
	},
});

function App() {
	const response = Route.useLoaderData();
	return (
		<div>
			<span className="text-2xl font-bold text-center">
				Hello World! This is Synergy 2026!
			</span>
			<Sample />
			<button
				type="button"
				onClick={async () => {
					await authClient.signIn.social({
						provider: "google",
					});
				}}
			>
				Sign in with Google
			</button>
			{response ? (
				<div>
					<p>Signed in as {response.user.email}</p>
					<p>Name: {response.user.name}</p>
					<p>
						Onboarding Complete:{" "}
						{response.user.onBoardingComplete ? "Yes" : "No"}
					</p>
					<button
						type="button"
						onClick={async () => {
							await authClient.signOut();
							window.location.reload();
						}}
					>
						Sign Out
					</button>
				</div>
			) : (
				<p>Not signed in</p>
			)}
			<div className="mt-8" />
			<EventsTest />
			<div className="mt-8" />
			<WorkshopsTest />
		</div>
	);
}
