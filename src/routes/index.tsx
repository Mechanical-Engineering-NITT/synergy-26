import { createFileRoute } from "@tanstack/react-router";
import ContactBadge from "@/components/common/contact-badge";
import Footer from "@/components/common/footer";
import Navbar from "@/components/common/navbar";
import AccommodationSection from "@/components/landing/accommodation";
import Events from "@/components/landing/events";
import Hero from "@/components/landing/hero";
import PricingComparison from "@/components/landing/pricing-comparison";
import MechReelSection from "@/components/landing/reel";
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
			<Navbar user={data?.user ?? null} />
			<Hero user={data?.user ?? null} />
			<PricingComparison />
			<Events isLoggedIn={!!data?.user} />
			<Workshops isLoggedIn={!!data?.user} />
			<MechReelSection />
			<AccommodationSection />
			<Footer />
			<ContactBadge />
		</div>
	);
}
