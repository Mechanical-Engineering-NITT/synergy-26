import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
	component: PrivacyPolicy,
});

function PrivacyPolicy() {
	return (
		<div className="min-h-screen bg-white">
			<div className="container mx-auto px-4 py-12 max-w-4xl">
				<h1 className="text-3xl font-bold mb-8 text-black">Privacy Policy</h1>
				<div className="space-y-6 text-black leading-relaxed">
					<p>
						The Mechanical Engineering Association (MEA), NIT Trichy, values
						your privacy. This policy explains how we collect, use, and protect
						your personal information.
					</p>

					<section>
						<h2 className="text-xl font-semibold text-black mb-3">
							1. Information Collection
						</h2>
						<p>
							We collect Information when you register for events or workshops,
							including your name, email address, college, and contact details.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-black mb-3">
							2. Use of Information
						</h2>
						<p>
							The information collected is used solely for the purpose of
							organizing Synergy 2026, managing registrations, and providing
							necessary updates regarding your participation.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-black mb-3">
							3. Data Security
						</h2>
						<p>
							We implement appropriate security measures to protect your
							personal information. Payment information is handled securely by
							Razorpay, and we do not store your financial data on our servers.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-black mb-3">
							4. Sharing of Information
						</h2>
						<p>
							We do not sell or share your personal information with third
							parties, except for service providers like Razorpay who help us
							facilitate transactions.
						</p>
					</section>

					<section className="bg-gray-100 p-4 rounded-lg border border-gray-200">
						<p className="text-sm italic">
							<strong>Disclaimer:</strong> The Computer Support Group (CSG), NIT
							Trichy, as the domain provider, shall not be held liable for any
							matters pertaining to Synergy 2026 or its financial transactions.
							The CSG is not responsible for any issues, disputes, or claims
							arising from Synergy and its associated payment processes. All
							liabilities and responsibilities concerning the same rest solely
							with the Mechanical Engineering Association (MEA), NIT Trichy.
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
