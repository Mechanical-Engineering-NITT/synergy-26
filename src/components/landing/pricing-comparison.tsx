export default function PricingComparison() {
	return (
		// biome-ignore lint: Static ID is required for anchor scrolling
		<section
			id="pricing"
			className="min-h-[80vh] bg-[#090521] overflow-hidden relative font-sans text-white selection:bg-[#9D00FF]/30"
		>
			{/* Background Image Layer */}
			<div className="absolute inset-0 z-0">
				<img
					src="/ewbg.webp"
					alt="Background"
					className="w-full h-full object-cover rotate-180 scale-x-[-1]"
				/>
				<div className="absolute inset-0 bg-black/40"></div>
			</div>

			<div className="relative z-10 p-6 max-w-6xl mx-auto py-20">
				<div className="text-center mb-12">
					<h1
						className="text-4xl sm:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-linear-to-b from-[#9D00FF] via-[#9D00FF] to-[#FFDD00] drop-shadow-[0_0_20px_rgba(255,221,0,0.3)] mb-2 uppercase text-center"
						style={{
							WebkitTextStroke: "1px rgba(255,255,255,0.1)",
							textShadow: "2px 2px 0px #FFDD00",
							filter: "drop-shadow(0 0 10px rgba(157,0,255,0.6))",
						}}
					>
						What's New?
					</h1>
					<p
						className="text-center text-[#FFDD00] font-bold tracking-widest uppercase mb-12 drop-shadow-[0_0_10px_rgba(255,221,0,0.8)]"
						style={{ fontFamily: "monospace" }}
					>
						50% price reduction over previous edition!
					</p>
				</div>

				<div className="relative group max-w-4xl mx-auto">
					{/* Glow effect */}
					<div className="absolute -inset-1 bg-linear-to-r from-[#9D00FF]/20 to-[#FFDD00]/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

					<div className="relative bg-[#090521]/80 backdrop-blur-xl border border-white/10 p-4 md:p-10 transition-all duration-500 hover:border-[#9D00FF]/40 shadow-2xl overflow-hidden">
						<div className="overflow-x-auto custom-scrollbar">
							<table className="w-full text-left font-bold border-collapse min-w-[320px]">
								<thead>
									<tr className="border-b border-white/10 text-[10px] md:text-sm">
										<th className="py-4 md:py-6 px-2 md:px-4 text-[#9D00FF] uppercase tracking-[0.2em] md:tracking-[0.3em] italic">
											Category
										</th>
										<th className="py-4 md:py-6 px-2 md:px-4 text-center text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.3em] italic">
											Previous
										</th>
										<th className="py-4 md:py-6 px-2 md:px-4 text-center text-[#FFDD00] uppercase tracking-[0.2em] md:tracking-[0.3em] italic">
											Synergy '26
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-white/5">
									<tr className="hover:bg-white/2 transition-colors text-xs md:text-lg">
										<td className="py-4 md:py-6 px-2 md:px-4 text-white uppercase tracking-wider">
											Workshop
										</td>
										<td className="py-4 md:py-6 px-2 md:px-4 text-center text-gray-500 tabular-nums">
											₹450
										</td>
										<td className="py-4 md:py-6 px-2 md:px-4 text-center text-white font-black tabular-nums">
											₹450
										</td>
									</tr>
									<tr className="hover:bg-white/2 transition-colors text-xs md:text-lg">
										<td className="py-4 md:py-6 px-2 md:px-4 text-white uppercase tracking-wider">
											Food
										</td>
										<td className="py-4 md:py-6 px-2 md:px-4 text-center text-gray-500 tabular-nums">
											₹475
										</td>
										<td className="py-4 md:py-6 px-2 md:px-4 text-center text-white font-black tabular-nums">
											₹150{" "}
											<span className="text-[9px] md:text-[10px] text-[#9D00FF] font-bold block mt-1 tracking-widest opacity-90 uppercase">
												(MESS)
											</span>
										</td>
									</tr>
									<tr className="hover:bg-white/2 transition-colors text-xs md:text-lg">
										<td className="py-4 md:py-6 px-2 md:px-4 text-white uppercase tracking-wider">
											Registration
										</td>
										<td className="py-4 md:py-6 px-2 md:px-4 text-center text-gray-500 tabular-nums">
											₹280
										</td>
										<td className="py-4 md:py-6 px-2 md:px-4 text-center text-[#FFDD00] font-black tabular-nums drop-shadow-[0_0_10px_rgba(255,221,0,0.4)]">
											FREE
										</td>
									</tr>
									<tr className="bg-linear-to-r from-[#9D00FF]/10 to-transparent relative text-sm md:text-2xl">
										<td className="py-6 md:py-8 px-2 md:px-4 text-[#9D00FF] font-black uppercase italic tracking-tighter">
											Total Value
										</td>
										<td className="py-6 md:py-8 px-2 md:px-4 text-center text-gray-500 line-through opacity-50 tabular-nums">
											₹1205
										</td>
										<td className="py-6 md:py-8 px-2 md:px-4 text-center text-white font-black tabular-nums drop-shadow-[0_0_15px_rgba(157,0,255,0.5)]">
											₹600
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<div className="mt-16 w-full py-8 border-y border-[#9D00FF]/20 bg-[#9D00FF]/5 backdrop-blur-sm">
					<p className="w-full text-center text-[#FFDD00] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] leading-tight text-lg md:text-3xl drop-shadow-[0_0_15px_rgba(255,221,0,0.4)]">
						EXCEPTIONAL VALUE. UNCOMPROMISED EXPERIENCE. MINIMUM COST.
					</p>
				</div>

				<div className="mt-12 flex justify-center">
					<div className="group relative bg-[#090521]/60 backdrop-blur-md border border-[#9D00FF]/30 p-4 md:p-6 -skew-x-2 transition-all hover:bg-[#9D00FF]/5 hover:border-[#9D00FF]/60 shadow-[5px_5px_0px_0px_rgba(157,0,255,0.2)]">
						<div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
							<div className="bg-[#9D00FF] text-black px-3 py-1 font-black text-[10px] uppercase tracking-widest">
								Note
							</div>
							<p className="text-gray-300 text-[10px] md:text-sm font-bold uppercase tracking-widest md:tracking-[0.15em] italic">
								If you don't want to attend any workshop and only need Event
								Pass, it will be just{" "}
								<span className="text-[#FFDD00] font-black underline decoration-[#9D00FF] underline-offset-4">
									₹100
								</span>
								.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
