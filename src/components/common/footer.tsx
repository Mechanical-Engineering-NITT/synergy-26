import { Link } from "@tanstack/react-router";

export default function Footer() {
	return (
		<footer className="w-full bg-black border-t border-white/10 pt-16 pb-12 mt-auto relative overflow-hidden">
			{/* Subtle grid overlap for consistency */}
			<div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>

			<div className="container mx-auto px-6 relative z-10">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
					{/* About Section */}
					<div className="space-y-6">
						<h3
							className="text-xl font-black italic uppercase tracking-[0.2em] text-transparent bg-clip-text bg-linear-to-b from-red-950 via-red-900 to-red-800"
							style={{
								WebkitTextStroke: "0.5px rgba(255,255,255,0.1)",
								textShadow: "1px 1px 0px #fef3c7",
							}}
						>
							Synergy 2026
						</h3>
						<p className="text-gray-400 text-sm leading-relaxed font-medium uppercase tracking-tight">
							Mechanical Engineering Association,
							<br />
							Department of Mechanical Engineering,
							<br />
							NIT Trichy.
						</p>
					</div>

					{/* Archive Section */}
					<div className="space-y-6">
						<h3 className="text-sm font-black text-cyan-400 uppercase tracking-[0.3em]">
							Archives
						</h3>
						<ul className="space-y-3 text-xs font-bold uppercase tracking-widest">
							{[
								{ label: "Synergy '25", href: "https://synergy.nitt.edu/25" },
								{ label: "Synergy '24", href: "https://synergy.nitt.edu/24" },
							].map((link) => (
								<li key={link.label}>
									<a
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-white/60 hover:text-amber-400 transition-colors flex items-center gap-2 group"
									>
										<span className="w-1 h-1 bg-cyan-500 group-hover:scale-150 transition-transform"></span>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Contact Section */}
					<div className="space-y-6">
						<h3 className="text-sm font-black text-cyan-400 uppercase tracking-[0.3em]">
							Contact Us
						</h3>
						<div className="text-white/60 text-xs font-bold uppercase tracking-widest space-y-3">
							<p className="flex flex-col gap-1">
								<span className="text-gray-500 text-[10px]">Email</span>
								<a
									href="mailto:mech.nitt.dev@gmail.com"
									className="text-amber-400 hover:text-white transition-colors"
								>
									mech.nitt.dev@gmail.com
								</a>
							</p>
							<p className="flex flex-col gap-1">
								<span className="text-gray-500 text-[10px]">Phone</span>
								<a
									href="tel:+919884035800"
									className="text-amber-400 hover:text-white transition-colors"
								>
									+91 9884035800
								</a>
							</p>
							<p className="mt-4 leading-relaxed">
								<span className="text-gray-500 text-[10px] block mb-1">
									Address
								</span>
								Department of Mechanical Engineering,
								<br />
								NIT Trichy, Thanjavur Road,
								<br />
								Trichy - 620015.
							</p>
						</div>
					</div>

					{/* Compliance Links */}
					<div className="space-y-6">
						<h3 className="text-sm font-black text-cyan-400 uppercase tracking-[0.3em]">
							Compliance
						</h3>
						<ul className="space-y-3 text-xs font-bold uppercase tracking-widest">
							{[
								{ label: "Terms and Conditions", to: "/terms-and-conditions" },
								{ label: "Privacy Policy", to: "/privacy-policy" },
								{ label: "Refund Policy", to: "/refund-policy" },
							].map((link) => (
								<li key={link.label}>
									<Link
										to={link.to}
										className="text-white/60 hover:text-amber-400 transition-colors flex items-center gap-2 group"
									>
										<span className="w-1 h-1 bg-cyan-500 group-hover:scale-150 transition-transform"></span>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="border-t border-white/5 pt-8 text-center">
					<p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.4em]">
						&copy; {new Date().getFullYear()} MEA NIT TRICHY {"//"} SYNTHESIZING
						EXCELLENCE
					</p>
				</div>
			</div>
		</footer>
	);
}
