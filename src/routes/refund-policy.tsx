import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/refund-policy")({
	component: RefundPolicy,
});

function RefundPolicy() {
	return (
		<div className="min-h-screen bg-black font-sans text-white selection:bg-fuchsia-500/30 relative overflow-hidden">
			{/* Starry Background Layer */}
			<div className="absolute inset-0 bg-black z-0">
				<div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
			</div>

			<div className="relative z-10 container mx-auto px-4 py-20 max-w-4xl">
				<h1
					className="text-4xl sm:text-6xl font-black italic tracking-wider text-transparent bg-clip-text bg-linear-to-b from-red-950 via-red-900 to-red-800 drop-shadow-[0_0_20px_rgba(254,243,199,0.3)] mb-12 uppercase text-center"
					style={{
						WebkitTextStroke: "1px rgba(255,255,255,0.05)",
						textShadow: "2px 2px 0px #fef3c7",
					}}
				>
					Refund Policy
				</h1>

				<div className="space-y-8 bg-zinc-900/40 backdrop-blur-md border border-white/10 p-8 md:p-12 -skew-x-1 shadow-[10px_10px_0px_0px_rgba(34,211,238,0.2)]">
					<section className="p-8 bg-red-950/20 border-2 border-red-500/50 -skew-y-1 relative overflow-hidden group">
						<div className="absolute inset-0 bg-red-500/5 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
						<h2 className="text-3xl font-black text-red-500 uppercase tracking-tighter italic mb-4 relative z-10">
							No Refunds
						</h2>
						<p className="text-gray-200 font-bold leading-relaxed uppercase tracking-wide relative z-10">
							Please note that all registrations and payments made for Synergy
							2026 events, workshops, or event passes are final.{" "}
							<span className="text-red-400 bg-red-400/10 px-1">
								No refunds
							</span>{" "}
							will be provided under any circumstances after the payment has
							been successfully processed.
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-xl font-black text-cyan-400 uppercase tracking-widest italic flex items-center gap-3">
							<span className="w-2 h-2 bg-amber-400"></span>
							Payment Issues
						</h2>
						<p className="text-gray-400 text-sm leading-relaxed font-bold uppercase tracking-tight">
							In case of a technical failure resulting in multiple deductions
							for the same service, please contact us with proof of payment, and
							we will look into the matter. However, voluntary cancellations are
							not eligible for refunds.
						</p>
					</section>

					<section className="bg-amber-400/10 p-6 border-l-4 border-amber-400 skew-x-2">
						<p className="text-xs font-bold text-amber-100 italic leading-relaxed uppercase tracking-tighter">
							<strong className="text-amber-400 mr-2">DISCLAIMER:</strong> The
							Computer Support Group (CSG), NIT Trichy, as the domain provider,
							shall not be held liable for any matters pertaining to Synergy
							2026 or its financial transactions. The CSG is not responsible for
							any issues, disputes, or claims arising from Synergy and its
							associated payment processes. All liabilities and responsibilities
							concerning the same rest solely with the Mechanical Engineering
							Association (MEA), NIT Trichy.
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
