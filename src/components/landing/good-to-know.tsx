import { Home, Info, MapPin, Utensils } from "lucide-react";

export default function GoodToKnow() {
	return (
		// biome-ignore lint/correctness/useUniqueElementIds: required for anchor scrolling
		<section
			id="good-to-know"
			className="overflow-hidden relative font-sans text-white selection:bg-[#9D00FF]/30 py-20 bg-transparent"
		>
			<div className="relative z-30 p-6 max-w-6xl mx-auto">
				<h1
					className="text-4xl sm:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-linear-to-b from-[#9D00FF] via-[#9D00FF] to-[#FFDD00] drop-shadow-[0_0_20px_rgba(255,221,0,0.3)] mb-2 uppercase text-center"
					style={{
						WebkitTextStroke: "1px rgba(255,255,255,0.1)",
						textShadow: "2px 2px 0px #FFDD00",
						filter: "drop-shadow(0 0 10px rgba(157,0,255,0.6))",
					}}
				>
					Good to Know
				</h1>
				<p
					className="text-center text-[#FFDD00] font-bold tracking-widest uppercase mb-12 drop-shadow-[0_0_10px_rgba(255,221,0,0.8)]"
					style={{ fontFamily: "monospace" }}
				>
					Essential Logistics
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* Mess Information */}
					<div className="group relative bg-[#090521]/60 backdrop-blur-md border border-white/10 p-6 transition-all duration-300 hover:border-[#9D00FF]/50 hover:shadow-[0_0_30px_rgba(157,0,255,0.2)] overflow-hidden -skew-x-2">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-[#9D00FF]/20 border border-[#9D00FF]/50">
								<Utensils className="w-5 h-5 text-[#FFDD00]" />
							</div>
							<h3 className="text-xl font-black uppercase italic tracking-wider text-white group-hover:text-[#FFDD00] transition-colors">
								Mess
							</h3>
						</div>
						<div className="space-y-3 font-bold uppercase tracking-tight text-gray-300">
							<p className="flex justify-between border-b border-white/5 pb-1 text-sm">
								<span>Meals:</span>
								<span className="text-white">Rs. 50</span>
							</p>
							<p className="flex justify-between border-b border-white/5 pb-1 text-sm">
								<span>Name:</span>
								<span className="text-white">F Mess</span>
							</p>
							<div className="space-y-1">
								<p className="text-[10px] text-gray-400">Landmark:</p>
								<p className="text-white text-xs">Turn Right from Bru Stall</p>
							</div>
							<a
								href="https://maps.app.goo.gl/FrkmjKAKgacDqErP6"
								target="_blank"
								rel="noopener noreferrer"
								className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-[#9D00FF]/10 border border-[#9D00FF]/30 text-[#9D00FF] hover:bg-[#9D00FF] hover:text-white transition-all duration-300 font-black text-[10px] tracking-[0.2em]"
							>
								<MapPin className="w-3 h-3" />
								VIEW MAPS
							</a>
						</div>
					</div>

					{/* Accommodation */}
					<div className="group relative bg-[#090521]/60 backdrop-blur-md border border-white/10 p-6 transition-all duration-300 hover:border-[#9D00FF]/50 hover:shadow-[0_0_30px_rgba(157,0,255,0.2)] overflow-hidden -skew-x-2">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-[#9D00FF]/20 border border-[#9D00FF]/50">
								<Home className="w-5 h-5 text-[#FFDD00]" />
							</div>
							<h3 className="text-xl font-black uppercase italic tracking-wider text-white group-hover:text-[#FFDD00] transition-colors">
								Hostels
							</h3>
						</div>
						<p className="text-[10px] text-gray-400 mb-2 uppercase font-black tracking-widest">
							Common Rooms:
						</p>
						<div className="grid grid-cols-2 gap-2 mb-4">
							{[
								{
									name: "Zircon A",
									url: "https://maps.app.goo.gl/baLKzcjo7c5ekEn1A",
								},
								{
									name: "Zircon B",
									url: "https://maps.app.goo.gl/LgtnJaziKqAQJXKEA",
								},
								{
									name: "Zircon C",
									url: "https://maps.app.goo.gl/JwtA1cMsbpfqyZZU7",
								},
								{
									name: "Opal A",
									url: "https://maps.app.goo.gl/qyJZRUM1tjEu3JRLA",
								},
							].map((hostel) => (
								<a
									key={hostel.name}
									href={hostel.url}
									target="_blank"
									rel="noopener noreferrer"
									className="p-2 bg-white/5 border border-white/10 text-[9px] font-black text-center hover:bg-[#9D00FF]/20 hover:border-[#9D00FF]/50 hover:text-[#FFDD00] transition-all tracking-widest"
								>
									{hostel.name}
								</a>
							))}
						</div>
						<p className="text-[9px] text-gray-500 italic text-center uppercase tracking-widest">
							Click to view location
						</p>
					</div>

					{/* Arrival */}
					<div className="group relative bg-[#090521]/60 backdrop-blur-md border border-white/10 p-6 transition-all duration-300 hover:border-[#9D00FF]/50 hover:shadow-[0_0_30px_rgba(157,0,255,0.2)] overflow-hidden -skew-x-2">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-[#9D00FF]/20 border border-[#9D00FF]/50">
								<Info className="w-5 h-5 text-[#FFDD00]" />
							</div>
							<h3 className="text-xl font-black uppercase italic tracking-wider text-white group-hover:text-[#FFDD00] transition-colors">
								Arrival
							</h3>
						</div>
						<div className="space-y-4">
							<p className="text-gray-300 font-bold uppercase tracking-tight leading-relaxed text-xs">
								On Arrival, please report at the{" "}
								<span className="text-[#FFDD00] font-black">PR DESK</span> for
								Check-in.
							</p>
							<a
								href="https://maps.app.goo.gl/CzVR3C3xZuDFBRoC9"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-center gap-2 w-full py-2 bg-[#9D00FF]/10 border border-[#9D00FF]/30 text-[#9D00FF] hover:bg-[#9D00FF] hover:text-white transition-all duration-300 font-black text-[10px] tracking-[0.2em]"
							>
								<MapPin className="w-3 h-3" />
								PR DESK
							</a>
						</div>
					</div>

					{/* Community */}
					<div className="group relative bg-[#090521]/60 backdrop-blur-md border border-white/10 p-6 transition-all duration-300 hover:border-[#9D00FF]/50 hover:shadow-[0_0_30px_rgba(157,0,255,0.2)] overflow-hidden -skew-x-2">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-[#9D00FF]/20 border border-[#9D00FF]/50">
								<svg
									className="w-5 h-5 text-[#FFDD00]"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<title>Community Icon</title>
									<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-13.4" />
									<path d="M22 2L11 13" />
									<path d="M22 2l-7 20-4-9-9-4 20-7z" />
								</svg>
							</div>
							<h3 className="text-xl font-black uppercase italic tracking-wider text-white group-hover:text-[#FFDD00] transition-colors">
								Join Us
							</h3>
						</div>
						<div className="space-y-4">
							<p className="text-gray-300 font-bold uppercase tracking-tight leading-relaxed text-xs">
								Connect with fellow attendees and get real-time updates.
							</p>
							<a
								href="https://chat.whatsapp.com/Ge11Q7XfC6sBAd74g45dZC"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-center gap-2 w-full py-2 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 font-black text-[10px] tracking-[0.2em]"
							>
								WHATSAPP GROUP
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
