export default function About() {
	return (
		// biome-ignore lint/correctness/useUniqueElementIds: required for anchor scrolling from another section
		<section
			id="about"
			className="min-h-screen overflow-hidden relative font-sans text-white selection:bg-[#9D00FF]/30"
		>
			<div className="relative z-30 p-6 max-w-6xl mx-auto py-20">
				{/* Section Header */}
				<div className="text-center mb-12">
					<h1
						className="text-4xl sm:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-linear-to-b from-[#9D00FF] via-[#9D00FF] to-[#FFDD00] drop-shadow-[0_0_20px_rgba(255,221,0,0.3)] mb-2 uppercase text-center"
						style={{
							WebkitTextStroke: "1px rgba(255,255,255,0.1)",
							textShadow: "2px 2px 0px #FFDD00",
							filter: "drop-shadow(0 0 10px rgba(157,0,255,0.6))",
						}}
					>
						Synergy
					</h1>
					<p
						className="text-center text-[#FFDD00] font-bold tracking-widest uppercase mb-12 drop-shadow-[0_0_10px_rgba(255,221,0,0.8)]"
						style={{ fontFamily: "monospace" }}
					>
						About Us
					</p>
				</div>

				<div className="group relative bg-[#090521]/60 backdrop-blur-md border border-white/10 p-10 md:p-16 transition-all duration-300 hover:border-[#9D00FF]/50 hover:shadow-[0_0_30px_rgba(157,0,255,0.2)] overflow-hidden -skew-x-2">
					{/* Animated Borders */}
					<div className="absolute top-0 left-0 w-0 h-0.5 bg-[#9D00FF] transition-all duration-500 group-hover:w-full"></div>
					<div className="absolute top-0 right-0 w-0.5 h-0 bg-[#9D00FF] transition-all duration-500 delay-100 group-hover:h-full"></div>
					<div className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#9D00FF] transition-all duration-500 delay-200 group-hover:w-full"></div>
					<div className="absolute bottom-0 left-0 w-0.5 h-0 bg-[#9D00FF] transition-all duration-500 delay-300 group-hover:h-full"></div>

					{/* Card Accent */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-[#9D00FF]/20 to-transparent -translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>

					<div className="relative z-10 skew-x-2 max-w-4xl mx-auto">
						<div className="flex flex-col gap-10">
							<div className="space-y-6 text-gray-300 font-bold uppercase tracking-tight leading-relaxed text-center">
								<p>
									CONDUCTED BY THE{" "}
									<strong className="text-white font-black bg-[#9D00FF]/20 px-1 border-b border-[#9D00FF]">
										MECHANICAL ENGINEERING ASSOCIATION (MEA)
									</strong>{" "}
									OF NIT TRICHY, SYNERGY IS A PREMIER PLATFORM DESIGNED TO
									CONNECT MECHANICAL ENTHUSIASTS ACROSS THE NATION.
								</p>
								<p>
									OVER THREE DAYS, WE HOST A MYRIAD OF WORKSHOPS, GUEST
									LECTURES, AND COMPETITIONS, PROVIDING STUDENTS AN OPPORTUNITY
									TO FOSTER THEIR RAW TALENTS AND SATIATE THEIR CURIOSITY
									THROUGH THE EXCHANGE OF IDEAS AND INNOVATION.
								</p>
							</div>

							{/* Stats section inside the card */}
							<div className="grid grid-cols-3 divide-x divide-white/10 pt-10 border-t border-white/5">
								<div className="flex flex-col items-center gap-1 px-4">
									<span className="text-[#9D00FF] font-black text-[10px] sm:text-xs tracking-widest mb-1">
										DAYS
									</span>
									<span className="text-2xl sm:text-4xl font-black text-white italic">
										03
									</span>
								</div>
								<div className="flex flex-col items-center gap-1 px-4">
									<span className="text-[#FFDD00] font-black text-[10px] sm:text-xs tracking-widest mb-1">
										ATTENDEES
									</span>
									<span className="text-2xl sm:text-4xl font-black text-white italic">
										2K+
									</span>
								</div>
								<div className="flex flex-col items-center gap-1 px-4">
									<span className="text-[#FF2E63] font-black text-[10px] sm:text-xs tracking-widest mb-1">
										SPANNING
									</span>
									<span className="text-2xl sm:text-4xl font-black text-white italic">
										INDIA
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
