import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-and-conditions")({
	component: TermsAndConditions,
});

function TermsAndConditions() {
	return (
		<div className="min-h-screen bg-white">
			<div className="container mx-auto px-4 py-12 max-w-4xl">
				<h1 className="text-3xl font-bold mb-8 text-black">
					Terms and Conditions
				</h1>
				<div className="space-y-6 text-black leading-relaxed">
					<p>
						Welcome to Synergy 2026. By accessing this website and registering
						for our events, you agree to comply with and be bound by the
						following terms and conditions.
					</p>

					<section>
						<h2 className="text-xl font-semibold text-black mb-3">
							1. Acceptance of Terms
						</h2>
						<p>
							Participation in Synergy 2026 events and workshops is subject to
							these terms. MEA NIT Trichy reserves the right to modify these
							terms at any time without prior notice.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-black mb-3">
							2. Registration and Payments
						</h2>
						<p>
							Registration is considered complete only upon receipt of payment.
							All payments are processed through Razorpay. You agree to provide
							accurate information during the registration process.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-black mb-3">
							3. Code of Conduct
						</h2>
						<p>
							Participants are expected to maintain decorum during events and
							workshops. Any form of misconduct may lead to disqualification
							without refund.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-black mb-3">
							4. Intellectual Property
						</h2>
						<p>
							All content on this website, including logos and event materials,
							is the property of MEA NIT Trichy.
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

					<section className="mt-8 border-t border-gray-200 pt-6">
						<h2 className="text-xl font-semibold text-black mb-3">
							Merchant Information
						</h2>
						<ul className="list-none space-y-1">
							<li>
								<strong>Entity:</strong> Mechanical Engineering Association,
								Department of Mechanical Engineering, NIT Trichy.
							</li>
							<li>
								<strong>Registered Office:</strong> Department of Mechanical
								Engineering, NIT Trichy, Thanjavur Road, Trichy - 620015.
							</li>
						</ul>
					</section>
				</div>
			</div>
		</div>
	);
}
