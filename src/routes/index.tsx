import { createFileRoute } from "@tanstack/react-router";
import ContactBadge from "@/components/common/contact-badge";
import Footer from "@/components/common/footer";
import Navbar from "@/components/common/navbar";
import About from "@/components/landing/about";
import AccommodationSection from "@/components/landing/accommodation";
import Events from "@/components/landing/events";
import Hero from "@/components/landing/hero";
import PreFestSection from "@/components/landing/pre-fest";
import PricingComparison from "@/components/landing/pricing-comparison";
import Schedule from "@/components/landing/schedule";
import Workshops from "@/components/landing/workshops";
import { enforceOnboarding } from "@/lib/utils";
import { getCurrentUserFullName } from "@/server/user";

export const Route = createFileRoute("/")({
	component: App,
	loader: async () => {
		const session = await enforceOnboarding();
		const profile = await getCurrentUserFullName({
			data: { userId: session?.user.id ?? null },
		});
		return { session: session, profile: profile };
	},
});

function App() {
	const data = Route.useLoaderData();
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar user={data.session?.user ?? null} />
			<Hero user={data.profile ?? null} />

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
					<Schedule />
					<PricingComparison />
					<Events isLoggedIn={!!data?.session?.user} />
					<Workshops isLoggedIn={!!data?.session?.user} />
					<PreFestSection />
					<AccommodationSection />
				</div>
			</div>

			<Footer />
			<ContactBadge />
		</div>
	);
}
