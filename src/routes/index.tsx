import { createFileRoute } from "@tanstack/react-router";
import AccommodationSection from "@/components/landing/accommodation";
import Footer from "@/components/common/footer";
import Hero from "@/components/landing/hero";
import { enforceOnboarding } from "@/lib/utils";
import Events from "@/components/landing/events";
import Workshops from "@/components/landing/workshops";

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
			<Hero user={data?.user ?? null} />
			<Events isLoggedIn={!!data?.user} />
			<Workshops isLoggedIn={!!data?.user} />
			<AccommodationSection isLoggedIn={!!data?.user} />
			<Footer />
		</div>
	);
}
