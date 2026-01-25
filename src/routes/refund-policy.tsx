import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/refund-policy")({
	component: RefundPolicy,
});

function RefundPolicy() {
	return (
		<div className="min-h-screen bg-white">
			<div className="container mx-auto px-4 py-12 max-w-4xl">
				<h1 className="text-3xl font-bold mb-8 text-black">Refund Policy</h1>
				<div className="space-y-6 text-black leading-relaxed">
					<section className="p-6 bg-red-50 border border-red-200 rounded-lg">
						<h2 className="text-xl font-semibold text-black mb-3">
							No Refunds
						</h2>
						<p>
							Please note that all registrations and payments made for Synergy
							2026 events, workshops, or event passes are final. **No refunds**
							will be provided under any circumstances after the payment has
							been successfully processed.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-black mb-3">
							Payment Issues
						</h2>
						<p>
							In case of a technical failure resulting in multiple deductions
							for the same service, please contact us with proof of payment, and
							we will look into the matter. However, voluntary cancellations are
							not eligible for refunds.
						</p>
					</section>

					<section className="bg-gray-100 p-4 rounded-lg border border-gray-200 mt-8">
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
