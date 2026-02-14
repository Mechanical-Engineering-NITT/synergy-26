import { MessageCircle, Phone, X } from "lucide-react";
import { useState } from "react";

export default function ContactBadge() {
	const [isOpen, setIsOpen] = useState(false);
	const name = "Synergy Helpdesk"; // Placeholder
	const phone = "+91 9884035800";
	const waLink = "https://wa.me/919884035800";

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
			{/* Contact Card */}
			{isOpen && (
				<div className="pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300">
					<div className="bg-[#090521]/90 backdrop-blur-xl border-2 border-[#9D00FF]/50 p-6 -skew-x-3 shadow-[0_0_40px_rgba(157,0,255,0.4)] relative overflow-hidden group">
						{/* Background Glow */}
						<div className="absolute top-0 right-0 w-16 h-16 bg-[#9D00FF]/20 blur-2xl group-hover:bg-[#FFDD00]/20 transition-colors"></div>

						{/* Close Button */}
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="absolute top-2 right-2 text-white/40 hover:text-white transition-colors"
						>
							<X size={16} />
						</button>

						<div className="relative z-10 skew-x-3">
							<p className="text-[10px] text-[#9D00FF] font-black uppercase tracking-[0.3em] mb-1">
								Contact Coordinator
							</p>
							<h4 className="text-white font-black text-lg uppercase italic tracking-wider mb-4 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
								{name}
							</h4>

							<div className="space-y-3">
								<a
									href={`tel:${phone}`}
									className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 hover:border-[#FFDD00]/50 hover:bg-[#FFDD00]/10 transition-all group/link"
								>
									<div className="w-8 h-8 bg-[#9D00FF]/20 flex items-center justify-center border border-[#9D00FF]/30 group-hover/link:bg-[#FFDD00]/20 group-hover/link:border-[#FFDD00]/40 transition-colors">
										<Phone
											size={14}
											className="text-[#9D00FF] group-hover/link:text-[#FFDD00]"
										/>
									</div>
									<span className="text-white font-bold tracking-widest text-sm">
										{phone}
									</span>
								</a>

								<a
									href={waLink}
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 hover:border-[#25D366]/50 hover:bg-[#25D366]/10 transition-all group/link"
								>
									<div className="w-8 h-8 bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20 group-hover/link:bg-[#25D366]/20 group-hover/link:border-[#25D366]/40 transition-colors">
										<MessageCircle size={14} className="text-[#25D366]" />
									</div>
									<span className="text-white font-bold tracking-widest text-sm text-[10px]">
										WHATSAPP US
									</span>
								</a>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Floating Button */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="pointer-events-auto relative group"
			>
				{/* Pulsing rings */}
				{!isOpen && (
					<>
						<div className="absolute inset-0 bg-[#9D00FF]/40 rounded-full animate-ping"></div>
						<div className="absolute inset-0 bg-[#9D00FF]/20 rounded-full animate-pulse"></div>
					</>
				)}

				<div
					className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_0_20px_rgba(157,0,255,0.4)] relative z-10
						${isOpen ? "bg-[#FFDD00] rotate-90 scale-110" : "bg-[#9D00FF] hover:scale-110 hover:bg-[#FFDD00]"}
					`}
				>
					{isOpen ? (
						<X className="text-black" size={24} />
					) : (
						<Phone
							className="text-white group-hover:text-black transition-colors"
							size={24}
						/>
					)}
				</div>

				{/* Tooltip */}
				{!isOpen && (
					<div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md px-3 py-1 border border-[#9D00FF]/50 text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
						Need help?
					</div>
				)}
			</button>
		</div>
	);
}
