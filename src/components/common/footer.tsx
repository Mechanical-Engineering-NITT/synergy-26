import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin } from "lucide-react";

export default function Footer() {
	return (
		<footer className="w-full bg-black border-t border-white/10 pt-16 mt-auto relative overflow-hidden">
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
									href="tel:+918807271377"
									className="text-amber-400 hover:text-white transition-colors"
								>
									+91 8807271377
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
							<div className="mt-6 flex gap-4 pt-2">
								<a
									href="https://www.instagram.com/synergynitt/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-white/60 hover:text-amber-400 transition-colors group/social"
								>
									<Instagram className="w-5 h-5 group-hover/social:scale-110 transition-transform" />
								</a>
								<a
									href="https://www.linkedin.com/company/synergy-nit-trichy/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-white/60 hover:text-amber-400 transition-colors group/social"
								>
									<Linkedin className="w-5 h-5 group-hover/social:scale-110 transition-transform" />
								</a>
							</div>
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

				<div className="border-t border-white/5 pt-8 text-center pb-12">
					<p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.4em]">
						&copy; {new Date().getFullYear()} MEA NIT TRICHY {"//"} SYNTHESIZING
						EXCELLENCE
					</p>
				</div>
			</div>
			{/* Credit Bar */}
			<div className="w-full bg-amber-400 py-5 relative z-10 shadow-[0_-10px_30px_rgba(251,191,36,0.2)]">
				<div className="container mx-auto px-6">
					<div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.4em] text-black">
						<span className="opacity-70">Made with love by</span>
						<div className="flex items-center gap-4">
							<a
								href="https://www.linkedin.com/in/arjun-gk/"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:-translate-y-px transition-all duration-300 active:scale-95 relative group"
							>
								Arjun
								<span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></span>
							</a>
							<span className="w-2.5 h-2.5 bg-cyan-600 rotate-45 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></span>
							<a
								href="https://www.linkedin.com/in/kat-exe"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:-translate-y-px transition-all duration-300 active:scale-95 relative group"
							>
								Ajay
								<span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></span>
							</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
