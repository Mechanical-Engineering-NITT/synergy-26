import { createFileRoute } from "@tanstack/react-router";
import AccommodationSection from "@/components/accommodation/booking-section";
import EventsTest from "@/components/events/test-events";
import WorkshopsTest from "@/components/events/test-workshops";
import Sample from "@/components/Sample";
import Footer from "@/components/Footer";
import { authClient } from "@/lib/auth-client";
import { enforceOnboarding } from "@/lib/utils";

export const Route = createFileRoute("/")({
	component: App,
	loader: async () => {
		const data = await enforceOnboarding();
		return data;
	},
});

function App() {
	const data = Route.useLoaderData();
	return (
		<div className="min-h-screen flex flex-col">
			<div className="grow">
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
				{data ? (
					<div>
						<p>Signed in as {data.user.email}</p>
						<p>Name: {data.user.name}</p>
						<p>
							Onboarding Complete: {data.user.onBoardingComplete ? "Yes" : "No"}
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
				<EventsTest isLoggedIn={!!data?.user} />
				<div className="mt-8" />
				<WorkshopsTest isLoggedIn={!!data?.user} />
				<div className="mt-8" />
				<AccommodationSection isLoggedIn={!!data?.user} />
			</div>
			<Footer />
		</div>
	);
}
