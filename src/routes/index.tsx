import { createFileRoute } from "@tanstack/react-router";
import ContactBadge from "@/components/common/contact-badge";
import Footer from "@/components/common/footer";
import Navbar from "@/components/common/navbar";
import About from "@/components/landing/about";
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

			<div className="relative bg-[#090521]">
				{/* Shared Background Layer */}
				<div className="absolute inset-0 z-0 pointer-events-none">
					<div className="sticky top-0 w-full h-screen overflow-hidden">
						<img
							src="/ewbg.webp"
							alt="Background"
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-0 bg-black/40"></div>
					</div>
				</div>

				<div className="relative z-10 w-full flex flex-col">
					<About />
					<PricingComparison />
					<Events isLoggedIn={!!data?.user} />
					<Workshops isLoggedIn={!!data?.user} />
					<MechReelSection />
					<AccommodationSection />
				</div>
			</div>

			<Footer />
			<ContactBadge />
		</div>
	);
}
