import { createFileRoute } from "@tanstack/react-router";
import ConstructionRibbon from "@/components/common/construction-ribbon";
import ContactBadge from "@/components/common/contact-badge";
import Footer from "@/components/common/footer";
import AccommodationSection from "@/components/landing/accommodation";
import Events from "@/components/landing/events";
import Hero from "@/components/landing/hero";
import Workshops from "@/components/landing/workshops";
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
			<ConstructionRibbon />
			<Hero user={data?.user ?? null} />
			<Events isLoggedIn={!!data?.user} />
			<Workshops isLoggedIn={!!data?.user} />
			<AccommodationSection />
			<Footer />
			<ContactBadge />
		</div>
	);
}
