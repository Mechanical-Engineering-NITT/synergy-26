export default function AccommodationSection() {
	const roomPrice = 250;

	return (
		<div className="min-h-screen bg-[#090521] overflow-hidden relative font-sans text-white selection:bg-[#9D00FF]/30">
			{/* Background Image */}
			<div className="absolute inset-0 z-0">
				<img
					src="/ewbg.webp"
					alt="Background"
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-black/40"></div>
			</div>

			<div className="relative z-30 p-6 max-w-6xl mx-auto py-20">
				<h1
					className="text-4xl sm:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-linear-to-b from-[#9D00FF] via-[#9D00FF] to-[#FFDD00] drop-shadow-[0_0_20px_rgba(255,221,0,0.3)] mb-2 uppercase text-center"
					style={{
						WebkitTextStroke: "1px rgba(255,255,255,0.1)",
						textShadow: "2px 2px 0px #FFDD00",
						filter: "drop-shadow(0 0 10px rgba(157,0,255,0.6))",
					}}
				>
					Accommodation
				</h1>
				<p
					className="text-center text-[#FFDD00] font-bold tracking-widest uppercase mb-12 drop-shadow-[0_0_10px_rgba(255,221,0,0.8)]"
					style={{ fontFamily: "monospace" }}
				>
					Secure your base
				</p>

				<div className="group relative bg-[#090521]/60 backdrop-blur-md border border-white/10 p-10 md:p-16 transition-all duration-300 hover:border-[#9D00FF]/50 hover:shadow-[0_0_30px_rgba(157,0,255,0.2)] overflow-hidden -skew-x-2 min-h-[400px] flex items-center">
					{/* Card Accent */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-[#9D00FF]/20 to-transparent -translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>

					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10 w-full">
						<div className="grow">
							<h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-wider mb-2 group-hover:text-[#FFDD00] transition-colors drop-shadow-[0_0_5px_rgba(157,0,255,0.5)]">
								Stay at NITT Campus
							</h3>
							<div className="h-0.5 w-16 bg-[#9D00FF] mb-8 transition-all group-hover:w-full duration-500 shadow-[0_0_5px_rgba(157,0,255,0.8)]"></div>

							<p className="text-gray-300 text-lg md:text-xl font-bold leading-relaxed uppercase tracking-tighter mb-10 max-w-2xl">
								A refundable security deposit of ₹300 is required at entry,
								returned upon departure subject to a damage-free inspection.
							</p>

							<div className="flex flex-wrap gap-6">
								<div className="flex items-center gap-4 text-sm md:text-base font-bold uppercase tracking-[0.2em] text-[#9D00FF] bg-[#9D00FF]/10 px-6 py-3 border border-[#9D00FF]/30">
									<span className="w-2 h-2 bg-[#9D00FF]"></span>
									<span className="text-gray-500">PRICE:</span>
									<span className="text-white font-black">
										₹{roomPrice} / night
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
