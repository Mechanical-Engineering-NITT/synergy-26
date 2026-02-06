import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getAllWorkshops } from "@/server/workshop";
import StatusSection from "../common/status-section";
import PaymentButton from "../payment/payment-button";

interface Workshop {
	id: number;
	title: string;
	description: string;
	time: Date;
	location: string;
	price: string;
	isRegistered: boolean;
}

export default function Workshops({ isLoggedIn }: { isLoggedIn: boolean }) {
	const queryClient = useQueryClient();
	const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(
		null,
	);

	const {
		isPending,
		isError,
		data: workshops,
		error,
	} = useQuery({
		queryKey: ["workshops"],
		queryFn: getAllWorkshops,
	});

	if (isPending) {
		return <StatusSection type="loading" />;
	}
	if (isError) {
		return (
			<StatusSection
				type="error"
				message={`Error loading workshops: ${error instanceof Error ? error.message : String(error)}`}
				onRetry={() =>
					queryClient.invalidateQueries({ queryKey: ["workshops"] })
				}
			/>
		);
	}

	return (
		<div className="min-h-screen bg-[#090521] overflow-hidden relative font-sans text-white selection:bg-[#FF2E63]/30">
			{/* 1. Starry Background Layer */}
			<div className="absolute inset-0 bg-[#090521] z-0">
				<div className="absolute inset-0 opacity-70 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
				<div className="absolute inset-0 bg-linear-to-b from-[#2a0e45]/20 to-[#090521] mix-blend-overlay"></div>
			</div>

			{/* 2. Retro Sun Section */}
			<div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-linear-to-t from-[#FFDD00] via-[#FF2E63] to-[#9D00FF] blur-md z-10 shadow-[0_0_80px_rgba(255,46,99,0.5)] opacity-60"></div>

			<div className="relative z-30 p-6 max-w-6xl mx-auto py-20">
				<h1
					className="text-4xl sm:text-6xl font-black italic tracking-wider text-transparent bg-clip-text bg-linear-to-b from-[#9D00FF] via-[#FF2E63] to-[#FFDD00] drop-shadow-[0_0_20px_rgba(255,221,0,0.3)] mb-2 uppercase text-center"
					style={{
						WebkitTextStroke: "1px rgba(255,255,255,0.1)",
						textShadow: "2px 2px 0px #FFDD00",
						filter: "drop-shadow(0 0 10px rgba(255,46,99,0.6))",
					}}
				>
					Workshops
				</h1>
				<p
					className="text-center text-[#FFDD00] font-bold tracking-widest uppercase mb-12 drop-shadow-[0_0_10px_rgba(255,221,0,0.8)]"
					style={{ fontFamily: "monospace" }}
				>
					Master the craft
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{workshops.length === 0 ? (
						<div className="col-span-full text-center py-20 bg-white/5 border border-white/10 backdrop-blur-sm -skew-x-2">
							<p className="text-[#FF2E63] font-black uppercase tracking-[0.3em] animate-pulse">
								No databanks found. Synchronization incomplete.
							</p>
						</div>
					) : (
						workshops.map((workshop) => (
							<div
								key={workshop.id}
								className="group relative bg-[#090521]/40 backdrop-blur-md border border-white/10 p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,46,99,0.2)] hover:-translate-y-1 overflow-hidden"
							>
								{/* Animated Borders */}
								<div className="absolute top-0 left-0 w-0 h-0.5 bg-[#FF2E63] transition-all duration-500 group-hover:w-full"></div>
								<div className="absolute top-0 right-0 w-0.5 h-0 bg-[#FF2E63] transition-all duration-500 delay-100 group-hover:h-full"></div>
								<div className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#FF2E63] transition-all duration-500 delay-200 group-hover:w-full"></div>
								<div className="absolute bottom-0 left-0 w-0.5 h-0 bg-[#FF2E63] transition-all duration-500 delay-300 group-hover:h-full"></div>

								{/* Card Accent */}
								<div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-[#FF2E63]/20 to-transparent -translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>

								<div className="mb-4">
									<h2 className="text-xl font-black text-white uppercase italic tracking-wider group-hover:text-[#FFDD00] transition-colors drop-shadow-[0_0_5px_rgba(255,46,99,0.5)]">
										{workshop.title}
									</h2>
									<div className="h-0.5 w-12 bg-[#FF2E63] mt-1 transition-all group-hover:w-full duration-500 shadow-[0_0_5px_rgba(255,46,99,0.8)]"></div>
								</div>

								<p className="text-gray-300 text-sm mb-6 line-clamp-2 font-medium leading-relaxed uppercase tracking-tight">
									{workshop.description}
								</p>

								<div className="space-y-3 mb-8 grow text-xs font-bold uppercase tracking-widest text-[#FF2E63]">
									<div className="flex items-center gap-3">
										<span className="w-1 h-1 bg-[#FFDD00] shadow-[0_0_5px_rgba(255,221,0,0.8)]"></span>
										<span className="text-gray-500">TIME:</span>
										<span className="text-white">
											{new Date(workshop.time).toLocaleString()}
										</span>
									</div>
									<div className="flex items-center gap-3">
										<span className="w-1 h-1 bg-[#FFDD00] shadow-[0_0_5px_rgba(255,221,0,0.8)]"></span>
										<span className="text-gray-500">LOC:</span>
										<span className="text-white">{workshop.location}</span>
									</div>
									<div className="flex items-center gap-3">
										<span className="w-1 h-1 bg-[#FFDD00] shadow-[0_0_5px_rgba(255,221,0,0.8)]"></span>
										<span className="text-gray-500">COST:</span>
										<span className="text-white">₹{workshop.price}</span>
									</div>
								</div>

								<div className="flex flex-col gap-3 mt-auto pt-6 border-t border-white/5">
									<button
										type="button"
										onClick={() => {
											if (!isLoggedIn) {
												toast.error("Please sign in to register");
												return;
											}
											setSelectedWorkshop(workshop);
										}}
										disabled={workshop.isRegistered}
										className={`w-full py-3 text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 -skew-x-6 flex items-center justify-center gap-2
                                            ${
																							workshop.isRegistered
																								? "bg-[#9D00FF]/20 text-[#FFDD00] border border-[#9D00FF]/50"
																								: "bg-[#FFDD00] text-black hover:bg-[#FFDD00] shadow-[4px_4px_0px_0px_rgba(255,46,99,1)] hover:translate-x-0.5 hover:translate-y-0.5"
																						}
                                            disabled:opacity-50`}
									>
										{workshop.isRegistered ? (
											<>
												<span className="text-[10px]">●</span> REGISTERED
											</>
										) : (
											"REGISTER"
										)}
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			{/* Registration Dialog */}
			{selectedWorkshop && (
				<div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
					<div className="bg-[#090521] border-2 border-[#FF2E63]/50 shadow-[0_0_80px_rgba(255,46,99,0.2)] max-w-lg w-full p-8 animate-in zoom-in-95 duration-300 relative">
						{/* Corner Accents */}
						<div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FFDD00]"></div>
						<div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FFDD00]"></div>
						<div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FFDD00]"></div>
						<div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FFDD00]"></div>

						<div className="flex justify-between items-start mb-6">
							<h3 className="text-2xl font-black uppercase italic tracking-widest bg-clip-text text-transparent bg-linear-to-r from-[#FF2E63] to-[#9D00FF]">
								{selectedWorkshop.title}
							</h3>
							<button
								type="button"
								onClick={() => setSelectedWorkshop(null)}
								className="text-[#FF2E63] hover:text-[#FFDD00] transition-colors text-2xl font-bold leading-none"
							>
								&times;
							</button>
						</div>

						<div className="space-y-6 mb-8">
							<div>
								<h4 className="text-[#FF2E63] text-xs font-black uppercase tracking-[0.2em] mb-2 drop-shadow-[0_0_5px_rgba(255,46,99,0.5)]">
									Description
								</h4>
								<p className="text-gray-300 text-sm leading-relaxed uppercase tracking-tight">
									{selectedWorkshop.description}
								</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="bg-white/5 border border-white/10 p-3">
									<p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
										Time
									</p>
									<p className="text-xs text-white font-black uppercase">
										{new Date(selectedWorkshop.time).toLocaleString()}
									</p>
								</div>
								<div className="bg-white/5 border border-white/10 p-3">
									<p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
										Location
									</p>
									<p className="text-xs text-white font-black uppercase">
										{selectedWorkshop.location}
									</p>
								</div>
							</div>

							<div className="bg-[#FF2E63]/10 p-4 border-l-4 border-[#FF2E63] flex justify-between items-center -skew-x-2">
								<span className="text-[#FF2E63] font-bold uppercase text-xs tracking-widest">
									Registration Fee
								</span>
								<span className="text-2xl font-black text-white italic drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
									₹{selectedWorkshop.price}
								</span>
							</div>
						</div>

						<div className="flex flex-col gap-4">
							<PaymentButton
								amount={Number.parseInt(selectedWorkshop.price, 10) * 100}
								workshopId={selectedWorkshop.id}
								onSuccess={() => {
									toast.success("Payment succeeded. Workshop registered!");
									setTimeout(() => {
										queryClient.invalidateQueries({ queryKey: ["workshops"] });
										setSelectedWorkshop(null);
									}, 1000);
								}}
								description={`Workshop: ${selectedWorkshop.title}`}
							/>
							<p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-widest mt-2">
								Payment is required for registration.
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
