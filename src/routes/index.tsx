import { createFileRoute } from "@tanstack/react-router";
import Sample from "@/components/Sample";
import { authClient } from "@/lib/auth-client";
import { getSession } from "@/server/session";

export const Route = createFileRoute("/")({
	component: App,
	loader: async () => {
		const session = await getSession();
		return { session };
	},
});

function App() {
	const { session } = Route.useLoaderData();
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
			{session ? (
				<div>
					<p>Signed in as {session.user.email}</p>
					<p>Name: {session.user.name}</p>
					<p>
						Onboarding Complete:{" "}
						{session.user.onBoardingComplete ? "Yes" : "No"}
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
		</div>
	);
}
