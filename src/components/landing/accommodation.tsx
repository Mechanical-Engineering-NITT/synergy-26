import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getAccommodationStatus } from "@/server/accommodation";
import StatusSection from "../common/status-section";
import PaymentButton from "../payment/payment-button";

export default function AccommodationSection({
	isLoggedIn,
}: {
	isLoggedIn: boolean;
}) {
	const queryClient = useQueryClient();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedNights, setSelectedNights] = useState(1);

	const { data: status, isLoading } = useQuery({
		queryKey: ["accommodationStatus"],
		queryFn: () => getAccommodationStatus(),
	});

	if (isLoading) {
		return (
			<StatusSection
				type="loading"
				message="Loading accommodation details..."
			/>
		);
	}

	const paidNights = status?.paidNights || 0;
	const maxNights = status?.maxNights || 3;
	const remainingNights = Math.max(0, maxNights - paidNights);
	const roomPrice = status?.roomPrice || 0;

	const handleOpenDialog = () => {
		if (!isLoggedIn) {
			toast.error("Please sign in to book accommodation");
			return;
		}
		if (remainingNights <= 0) {
			toast.error("You have already booked the maximum 3 nights.");
			return;
		}
		setIsDialogOpen(true);
	};

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
								<div className="flex items-center gap-4 text-sm md:text-base font-bold uppercase tracking-[0.2em] text-[#9D00FF] bg-[#9D00FF]/10 px-6 py-3 border border-[#9D00FF]/30">
									<span className="w-2 h-2 bg-[#FFDD00]"></span>
									<span className="text-gray-500">STATUS:</span>
									<span className="text-white font-black">
										{paidNights} / {maxNights} nights paid
									</span>
								</div>
							</div>
						</div>

						<button
							type="button"
							onClick={handleOpenDialog}
							className={`w-full md:w-auto px-12 py-5 font-black uppercase tracking-[0.2em] text-xl transition-all duration-300 -skew-x-12 relative overflow-hidden group/btn shrink-0
								${
									remainingNights <= 0
										? "bg-[#090521] text-gray-500 border border-white/10 cursor-not-allowed"
										: "bg-[#FFDD00] text-black hover:bg-[#FFDD00] shadow-[8px_8px_0px_0px_rgba(157,0,255,1)] hover:translate-x-1 hover:translate-y-1 active:translate-y-2"
								}`}
							disabled={remainingNights <= 0}
						>
							<span className="relative z-10 block skew-x-12">
								{remainingNights <= 0 ? "FULLY BOOKED" : "BOOK NOW"}
							</span>
							{remainingNights > 0 && (
								<div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500 skew-x-12"></div>
							)}
						</button>
					</div>
				</div>
			</div>

			{isDialogOpen && (
				<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
					<div className="bg-[#090521] border-2 border-[#9D00FF]/50 shadow-[0_0_80px_rgba(157,0,255,0.4)] max-w-md w-full p-8 animate-in zoom-in-95 duration-300 relative">
						{/* Corner Accents */}
						<div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FFDD00]"></div>
						<div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FFDD00]"></div>
						<div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FFDD00]"></div>
						<div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FFDD00]"></div>

						<div className="flex justify-between items-start mb-6">
							<h3 className="text-2xl font-black uppercase italic tracking-widest bg-clip-text text-transparent bg-linear-to-r from-[#9D00FF] to-[#9D00FF] drop-shadow-[0_0_5px_rgba(157,0,255,0.5)]">
								Book Stay
							</h3>
							<button
								type="button"
								onClick={() => setIsDialogOpen(false)}
								className="text-[#9D00FF] hover:text-[#FFDD00] transition-colors text-2xl font-bold leading-none"
							>
								&times;
							</button>
						</div>

						<p className="text-gray-400 text-sm font-medium uppercase tracking-tight mb-8 leading-relaxed">
							Select the number of nights you wish to stay. You can book up to a
							total of {maxNights} nights.
						</p>

						<div className="space-y-6 mb-8">
							<div>
								<span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">
									Select Duration (Nights)
								</span>
								<div className="flex items-center gap-4">
									{[...Array(remainingNights)].map((_, i) => {
										const nights = i + 1;
										const isSelected = selectedNights === nights;
										return (
											<button
												key={nights}
												type="button"
												onClick={() => setSelectedNights(nights)}
												className={`w-14 h-14 border-2 flex items-center justify-center font-black transition-all -skew-x-6
													${
														isSelected
															? "border-[#FFDD00] bg-[#FFDD00] text-black shadow-[4px_4px_0px_0px_rgba(157,0,255,1)]"
															: "border-white/10 text-white hover:border-[#9D00FF]/50 hover:bg-white/5"
													}`}
											>
												<span className="skew-x-6">{nights}</span>
											</button>
										);
									})}
								</div>
								<p className="mt-4 text-[10px] text-[#9D00FF] font-bold uppercase tracking-wider">
									Availability: {remainingNights}{" "}
									{remainingNights === 1 ? "night" : "nights"} remaining
								</p>
							</div>
						</div>

						<div className="bg-white/5 border border-white/10 p-5 mb-8 -skew-x-2">
							<div className="flex justify-between items-center bg-[#9D00FF]/10 p-2 border-l-4 border-[#9D00FF]">
								<span className="text-[#9D00FF] font-bold uppercase text-xs tracking-widest">
									TOTAL PRICE
								</span>
								<span className="text-2xl font-black text-white italic drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
									₹{roomPrice * selectedNights}
								</span>
							</div>
						</div>

						<div className="flex flex-col gap-4">
							<PaymentButton
								amount={roomPrice * selectedNights * 100}
								accommodation={selectedNights}
								onSuccess={() => {
									toast.success("Booking successful!");
									queryClient.invalidateQueries({
										queryKey: ["accommodationStatus"],
									});
									setIsDialogOpen(false);
								}}
								description={`${selectedNights} Night(s) Accommodation`}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
