import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-and-conditions")({
	component: TermsAndConditions,
});

function TermsAndConditions() {
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
					Terms & Conditions
				</h1>

				<div className="space-y-8 bg-zinc-900/40 backdrop-blur-md border border-white/10 p-8 md:p-12 -skew-x-1 shadow-[10px_10px_0px_0px_rgba(34,211,238,0.2)]">
					<p className="text-gray-300 leading-relaxed font-medium uppercase tracking-tight">
						Welcome to Synergy 2026. By accessing this website and registering
						for our events, you agree to comply with and be bound by the
						following terms and conditions.
					</p>

					<section className="space-y-4">
						<h2 className="text-xl font-black text-cyan-400 uppercase tracking-widest italic flex items-center gap-3">
							<span className="w-2 h-2 bg-amber-400"></span>
							1. Acceptance of Terms
						</h2>
						<p className="text-gray-400 text-sm leading-relaxed font-medium tracking-wide">
							Participation in Synergy 2026 events and workshops is subject to
							these terms. MEA NIT Trichy reserves the right to modify these
							terms at any time without prior notice.
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-xl font-black text-cyan-400 uppercase tracking-widest italic flex items-center gap-3">
							<span className="w-2 h-2 bg-amber-400"></span>
							2. Registration and Payments
						</h2>
						<p className="text-gray-400 text-sm leading-relaxed font-medium tracking-wide">
							Registration is considered complete only upon receipt of payment.
							All payments are processed through Razorpay. You agree to provide
							accurate information during the registration process.
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-xl font-black text-cyan-400 uppercase tracking-widest italic flex items-center gap-3">
							<span className="w-2 h-2 bg-amber-400"></span>
							3. Code of Conduct
						</h2>
						<p className="text-gray-400 text-sm leading-relaxed font-medium tracking-wide">
							Participants are expected to maintain decorum during events and
							workshops. Any form of misconduct may lead to disqualification
							without refund.
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-xl font-black text-cyan-400 uppercase tracking-widest italic flex items-center gap-3">
							<span className="w-2 h-2 bg-amber-400"></span>
							4. Intellectual Property
						</h2>
						<p className="text-gray-400 text-sm leading-relaxed font-medium tracking-wide">
							All content on this website, including logos and event materials,
							is the property of MEA NIT Trichy.
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

					<section className="mt-8 border-t border-white/10 pt-8 space-y-4">
						<h2 className="text-sm font-black text-cyan-400 uppercase tracking-[0.3em]">
							Merchant Information
						</h2>
						<ul className="list-none space-y-3 text-xs font-bold uppercase tracking-widest text-gray-400">
							<li className="flex flex-col gap-1">
								<span className="text-white/40 text-[10px]">Entity</span>
								Mechanical Engineering Association, Department of Mechanical
								Engineering, NIT Trichy.
							</li>
							<li className="flex flex-col gap-1">
								<span className="text-white/40 text-[10px]">
									Registered Office
								</span>
								Department of Mechanical Engineering, NIT Trichy, Thanjavur
								Road, Trichy - 620015.
							</li>
						</ul>
					</section>
				</div>
			</div>
		</div>
	);
}
