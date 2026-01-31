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
		<div className="min-h-screen bg-black overflow-hidden relative font-sans text-white selection:bg-fuchsia-500/30">
			{/* 1. Starry Background Layer */}
			<div className="absolute inset-0 bg-black z-0">
				<div className="absolute inset-0 opacity-70 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
			</div>

			{/* 2. Retro Sun Section */}
			<div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-linear-to-t from-yellow-400 via-pink-500 to-purple-600 blur-sm z-10 shadow-[0_0_50px_rgba(236,72,153,0.5)] opacity-50"></div>

			<div className="relative z-30 p-6 max-w-6xl mx-auto py-20">
				<h1
					className="text-4xl sm:text-6xl font-black italic tracking-wider text-transparent bg-clip-text bg-linear-to-b from-red-950 via-red-900 to-red-800 drop-shadow-[0_0_20px_rgba(254,243,199,0.3)] mb-2 uppercase text-center"
					style={{
						WebkitTextStroke: "1px rgba(255,255,255,0.05)",
						textShadow: "2px 2px 0px #fef3c7",
					}}
				>
					Workshops
				</h1>
				<p
					className="text-center text-yellow-300 font-bold tracking-widest uppercase mb-12"
					style={{ fontFamily: "monospace" }}
				>
					Master the craft
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{workshops.length === 0 ? (
						<div className="col-span-full text-center py-20 bg-white/5 border border-white/10 backdrop-blur-sm -skew-x-2">
							<p className="text-cyan-400 font-black uppercase tracking-[0.3em] animate-pulse">
								No databanks found. Synchronization incomplete.
							</p>
						</div>
					) : (
						workshops.map((workshop) => (
							<div
								key={workshop.id}
								className="group relative bg-zinc-900/40 backdrop-blur-md border border-white/10 p-6 flex flex-col transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:-translate-y-1 overflow-hidden"
							>
								{/* Card Accent */}
								<div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-cyan-500/10 to-transparent -translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>

								<div className="mb-4">
									<h2 className="text-xl font-black text-white uppercase italic tracking-wider group-hover:text-cyan-400 transition-colors">
										{workshop.title}
									</h2>
									<div className="h-0.5 w-12 bg-amber-400 mt-1 transition-all group-hover:w-full duration-500"></div>
								</div>

								<p className="text-gray-400 text-sm mb-6 line-clamp-2 font-medium leading-relaxed uppercase tracking-tight">
									{workshop.description}
								</p>

								<div className="space-y-3 mb-8 grow text-xs font-bold uppercase tracking-widest text-cyan-400/70">
									<div className="flex items-center gap-3">
										<span className="w-1 h-1 bg-cyan-400"></span>
										<span className="text-gray-500">TIME:</span>
										<span className="text-white">
											{new Date(workshop.time).toLocaleString()}
										</span>
									</div>
									<div className="flex items-center gap-3">
										<span className="w-1 h-1 bg-cyan-400"></span>
										<span className="text-gray-500">LOC:</span>
										<span className="text-white">{workshop.location}</span>
									</div>
									<div className="flex items-center gap-3">
										<span className="w-1 h-1 bg-cyan-400"></span>
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
																								? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
																								: "bg-amber-400 text-black hover:bg-amber-300 shadow-[4px_4px_0px_0px_rgba(34,211,238,1)] hover:translate-x-0.5 hover:translate-y-0.5"
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
				<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
					<div className="bg-zinc-950 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(34,211,238,0.2)] max-w-lg w-full p-8 animate-in zoom-in-95 duration-300 relative">
						{/* Corner Accents */}
						<div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
						<div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
						<div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
						<div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

						<div className="flex justify-between items-start mb-6">
							<h3 className="text-2xl font-black uppercase italic tracking-widest bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-blue-500">
								{selectedWorkshop.title}
							</h3>
							<button
								type="button"
								onClick={() => setSelectedWorkshop(null)}
								className="text-cyan-400 hover:text-white transition-colors text-2xl font-bold leading-none"
							>
								&times;
							</button>
						</div>

						<div className="space-y-6 mb-8">
							<div>
								<h4 className="text-cyan-400 text-xs font-black uppercase tracking-[0.2em] mb-2">
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

							<div className="bg-cyan-500/10 p-4 border-l-4 border-cyan-400 flex justify-between items-center -skew-x-2">
								<span className="text-cyan-400 font-bold uppercase text-xs tracking-widest">
									Registration Fee
								</span>
								<span className="text-2xl font-black text-white italic">
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
