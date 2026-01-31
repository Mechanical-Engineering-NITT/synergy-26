import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
	component: PrivacyPolicy,
});

function PrivacyPolicy() {
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
					Privacy Policy
				</h1>

				<div className="space-y-8 bg-zinc-900/40 backdrop-blur-md border border-white/10 p-8 md:p-12 -skew-x-1 shadow-[10px_10px_0px_0px_rgba(34,211,238,0.2)]">
					<p className="text-gray-300 leading-relaxed font-medium uppercase tracking-tight">
						The Mechanical Engineering Association (MEA), NIT Trichy, values
						your privacy. This policy explains how we collect, use, and protect
						your personal information.
					</p>

					<section className="space-y-4">
						<h2 className="text-xl font-black text-cyan-400 uppercase tracking-widest italic flex items-center gap-3">
							<span className="w-2 h-2 bg-amber-400"></span>
							1. Information Collection
						</h2>
						<p className="text-gray-400 text-sm leading-relaxed font-medium tracking-wide">
							We collect Information when you register for events or workshops,
							including your name, email address, college, and contact details.
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-xl font-black text-cyan-400 uppercase tracking-widest italic flex items-center gap-3">
							<span className="w-2 h-2 bg-amber-400"></span>
							2. Use of Information
						</h2>
						<p className="text-gray-400 text-sm leading-relaxed font-medium tracking-wide">
							The information collected is used solely for the purpose of
							organizing Synergy 2026, managing registrations, and providing
							necessary updates regarding your participation.
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-xl font-black text-cyan-400 uppercase tracking-widest italic flex items-center gap-3">
							<span className="w-2 h-2 bg-amber-400"></span>
							3. Data Security
						</h2>
						<p className="text-gray-400 text-sm leading-relaxed font-medium tracking-wide">
							We implement appropriate security measures to protect your
							personal information. Payment information is handled securely by
							Razorpay, and we do not store your financial data on our servers.
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-xl font-black text-cyan-400 uppercase tracking-widest italic flex items-center gap-3">
							<span className="w-2 h-2 bg-amber-400"></span>
							4. Sharing of Information
						</h2>
						<p className="text-gray-400 text-sm leading-relaxed font-medium tracking-wide">
							We do not sell or share your personal information with third
							parties, except for service providers like Razorpay who help us
							facilitate transactions.
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
