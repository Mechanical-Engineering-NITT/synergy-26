import { useQuery, useQueryClient } from "@tanstack/react-query";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { getAllWorkshops } from "@/server/workshop";
import StatusSection from "../common/status-section";
import PaymentButton from "../payment/payment-button";

interface Workshop {
	id: number;
	title: string;
	description: string;
	longDescription: string;
	time: string;
	location: string;
	price: string;
	isRegistered: boolean;
	isDisabled: boolean;
}

export default function Workshops({ isLoggedIn }: { isLoggedIn: boolean }) {
	const queryClient = useQueryClient();
	const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(
		null,
	);
	const [dialogMode, setDialogMode] = useState<"view" | "register" | null>(
		null,
	);
	const [showArchived, setShowArchived] = useState(false);

	const [emblaRef, emblaApi] = useEmblaCarousel(
		{ loop: true, align: "start" },
		[
			Autoplay({
				delay: 3000,
				stopOnInteraction: false,
				stopOnMouseEnter: true,
			}),
		],
	);

	const scrollPrev = useCallback(() => {
		if (emblaApi) emblaApi.scrollPrev();
	}, [emblaApi]);

	const scrollNext = useCallback(() => {
		if (emblaApi) emblaApi.scrollNext();
	}, [emblaApi]);

	const {
		isPending,
		isError,
		data: workshops,
		error,
	} = useQuery({
		queryKey: ["workshops"],
		queryFn: getAllWorkshops,
	});

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") setSelectedWorkshop(null);
		};

		if (selectedWorkshop) {
			document.body.style.overflow = "hidden";
			window.addEventListener("keydown", handleEscape);
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
			window.removeEventListener("keydown", handleEscape);
		};
	}, [selectedWorkshop]);

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
		// biome-ignore lint: Static ID is required for anchor scrolling
		<div
			id="workshops"
			className="min-h-screen overflow-hidden relative font-sans text-white selection:bg-[#9D00FF]/30"
		>
			<div className="relative z-30 p-6 max-w-6xl mx-auto py-20">
				<h1
					className="text-4xl sm:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-linear-to-b from-[#9D00FF] via-[#9D00FF] to-[#FFDD00] drop-shadow-[0_0_20px_rgba(255,221,0,0.3)] mb-2 uppercase text-center"
					style={{
						WebkitTextStroke: "1px rgba(255,255,255,0.1)",
						textShadow: "2px 2px 0px #FFDD00",
						filter: "drop-shadow(0 0 10px rgba(157,0,255,0.6))",
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

				<div className="relative">
					{!showArchived ? (
						<div className="text-center py-16 bg-white/5 border border-white/10 backdrop-blur-sm relative">
							<p className="text-4xl mb-3">🏁</p>
							<p className="text-white font-black uppercase tracking-[0.2em] text-lg mb-2">
								Symposium Concluded
							</p>
							<p className="text-gray-400 text-sm font-medium uppercase tracking-widest">
								Synergy '26 has come to an end. Thank you for participating!
							</p>
							<button
								type="button"
								onClick={() => setShowArchived(true)}
								className="absolute bottom-3 right-4 text-[8px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#9D00FF] transition-colors underline underline-offset-2"
							>
								View Archived Workshops
							</button>
						</div>
					) : workshops.length === 0 ? (
						<div className="text-center py-20 bg-white/5 border border-white/10 backdrop-blur-sm -skew-x-2">
							<p className="text-[#9D00FF] font-black uppercase tracking-[0.3em] animate-pulse">
								No databanks found. Synchronization incomplete.
							</p>
						</div>
					) : (
						<div className="relative group/carousel">
							<div className="mb-4 flex items-center justify-between">
								<span className="text-xs font-bold uppercase tracking-widest text-gray-500 border border-gray-700 px-3 py-1">
									📦 Archived
								</span>
								<button
									type="button"
									onClick={() => setShowArchived(false)}
									className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
								>
									✕ Hide
								</button>
							</div>
							<div className="overflow-hidden py-4" ref={emblaRef}>
								<div className="flex -ml-6">
									{workshops.map((workshop) => (
										<div
											key={workshop.id}
											className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-6 min-w-0"
										>
											<div className="group relative bg-[#090521]/40 backdrop-blur-md border border-white/10 p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_30px_rgba(157,0,255,0.2)] hover:-translate-y-1 overflow-hidden h-full">
												{/* Animated Borders */}
												<div className="absolute top-0 left-0 w-0 h-0.5 bg-[#9D00FF] transition-all duration-500 group-hover:w-full"></div>
												<div className="absolute top-0 right-0 w-0.5 h-0 bg-[#9D00FF] transition-all duration-500 delay-100 group-hover:h-full"></div>
												<div className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#9D00FF] transition-all duration-500 delay-200 group-hover:w-full"></div>
												<div className="absolute bottom-0 left-0 w-0.5 h-0 bg-[#9D00FF] transition-all duration-500 delay-300 group-hover:h-full"></div>

												{/* Card Accent */}
												<div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-[#9D00FF]/20 to-transparent -translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>

												{/* Workshop Image */}
												<div className="relative aspect-video mb-6 overflow-hidden border border-white/10 group-hover:border-[#9D00FF]/50 transition-all duration-500">
													<img
														src={`/workshops/${workshop.id}.webp`}
														alt={workshop.title}
														className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
													/>
													<div className="absolute inset-0 bg-linear-to-t from-[#090521] via-transparent to-transparent opacity-80"></div>
												</div>

												<div className="mb-4">
													<h2 className="text-xl font-black text-white uppercase italic tracking-wider group-hover:text-[#FFDD00] transition-colors drop-shadow-[0_0_5px_rgba(157,0,255,0.5)]">
														{workshop.title}
													</h2>
													<div className="h-0.5 w-12 bg-[#9D00FF] mt-1 transition-all group-hover:w-full duration-500 shadow-[0_0_5px_rgba(157,0,255,0.8)]"></div>
												</div>

												<p className="text-gray-300 text-sm mb-6 line-clamp-2 font-medium leading-relaxed uppercase tracking-tight">
													{workshop.description}
												</p>

												<div className="space-y-3 mb-8 grow text-xs font-bold uppercase tracking-widest text-[#9D00FF]">
													<div className="flex items-center gap-3">
														<span className="w-1 h-1 bg-[#FFDD00] shadow-[0_0_5px_rgba(255,221,0,0.8)]"></span>
														<span className="text-gray-500">TIME:</span>
														<span className="text-white">{workshop.time}</span>
													</div>
													<div className="flex items-center gap-3">
														<span className="w-1 h-1 bg-[#FFDD00] shadow-[0_0_5px_rgba(255,221,0,0.8)]"></span>
														<span className="text-gray-500">LOC:</span>
														<span className="text-white">
															{workshop.location}
														</span>
													</div>
													<div className="flex items-center gap-3">
														<span className="w-1 h-1 bg-[#FFDD00] shadow-[0_0_5px_rgba(255,221,0,0.8)]"></span>
														<span className="text-gray-500">COST:</span>
														<span className="text-white">
															₹{workshop.price}
														</span>
													</div>
												</div>

												<div className="flex flex-col gap-3 mt-auto pt-6 border-t border-white/5">
													<button
														type="button"
														onClick={() => {
															setDialogMode("view");
															setSelectedWorkshop(workshop);
														}}
														className="w-full py-2 text-xs font-black uppercase tracking-[0.2em] border border-white/20 hover:bg-white hover:text-black transition-all duration-300 -skew-x-6"
													>
														View Details
													</button>
													<button
														type="button"
														onClick={() => {
															if (workshop.isDisabled) {
																toast.error(
																	"Registration for this workshop is closed.",
																);
																return;
															}
															if (!isLoggedIn) {
																toast.error("Please sign in to register");
																return;
															}
															setDialogMode("register");
															setSelectedWorkshop(workshop);
														}}
														disabled={workshop.isRegistered}
														className={`w-full py-3 text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 -skew-x-6 flex items-center justify-center gap-2
                                             ${
																								workshop.isDisabled
																									? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
																									: workshop.isRegistered
																										? "bg-[#9D00FF]/20 text-[#FFDD00] border border-[#9D00FF]/50"
																										: "bg-[#FFDD00] text-black hover:bg-[#FFDD00] shadow-[4px_4px_0px_0px_rgba(157,0,255,1)] hover:translate-x-0.5 hover:translate-y-0.5"
																							}
                                             disabled:opacity-50`}
													>
														{workshop.isDisabled ? (
															"REGISTRATION CLOSED"
														) : workshop.isRegistered ? (
															<>
																<span className="text-[10px]">●</span>{" "}
																REGISTERED
															</>
														) : (
															"REGISTER"
														)}
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							<button
								type="button"
								className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-[#090521]/80 border border-[#9D00FF] p-3 rounded-full text-[#FFDD00] transition-all hover:bg-[#9D00FF] hover:text-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={scrollPrev}
							>
								<ChevronLeft size={24} />
							</button>

							<button
								type="button"
								className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 bg-[#090521]/80 border border-[#9D00FF] p-3 rounded-full text-[#FFDD00] transition-all hover:bg-[#9D00FF] hover:text-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={scrollNext}
							>
								<ChevronRight size={24} />
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Registration Dialog */}
			{selectedWorkshop &&
				createPortal(
					<div className="fixed inset-0 flex items-center justify-center z-9999 p-4 animate-in fade-in duration-300">
						{/* Backdrop Button */}
						<button
							type="button"
							onClick={() => setSelectedWorkshop(null)}
							className="absolute inset-0 w-full h-full bg-black/90 backdrop-blur-md cursor-pointer border-none"
							aria-label="Close dialog"
						/>
						<div className="bg-[#090521] border-2 border-[#9D00FF]/50 shadow-[0_0_80px_rgba(157,0,255,0.2)] max-w-lg w-full max-h-[90vh] flex flex-col p-8 animate-in zoom-in-95 duration-300 relative">
							{/* Corner Accents */}
							<div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FFDD00]"></div>
							<div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FFDD00]"></div>
							<div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FFDD00]"></div>
							<div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FFDD00]"></div>

							<div className="flex justify-between items-start mb-6">
								<h3 className="text-2xl font-black uppercase italic tracking-widest bg-clip-text text-transparent bg-linear-to-r from-[#9D00FF] to-[#9D00FF]">
									{selectedWorkshop.title}
								</h3>
								<button
									type="button"
									onClick={() => setSelectedWorkshop(null)}
									className="text-[#9D00FF] hover:text-[#FFDD00] transition-colors text-2xl font-bold leading-none"
								>
									&times;
								</button>
							</div>

							<div className="space-y-6 mb-8 overflow-y-auto pr-2 custom-scrollbar overscroll-behavior-contain">
								<div>
									<h4 className="text-[#9D00FF] text-xs font-black uppercase tracking-[0.2em] mb-2 drop-shadow-[0_0_5px_rgba(157,0,255,0.5)]">
										Description
									</h4>
									<p className="text-gray-300 text-sm leading-relaxed uppercase tracking-tight">
										{selectedWorkshop.description}
									</p>
								</div>

								{selectedWorkshop.longDescription && (
									<div>
										<h4 className="text-[#9D00FF] text-xs font-black uppercase tracking-[0.2em] mb-2 drop-shadow-[0_0_5px_rgba(157,0,255,0.5)]">
											Details
										</h4>
										<p className="text-gray-300 text-sm leading-relaxed uppercase tracking-tight whitespace-pre-wrap">
											{selectedWorkshop.longDescription}
										</p>
									</div>
								)}

								<div className="grid grid-cols-2 gap-4">
									<div className="bg-white/5 border border-white/10 p-3">
										<p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
											Time
										</p>
										<p className="text-xs text-white font-black uppercase">
											{selectedWorkshop.time}
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

								{dialogMode === "register" && (
									<div className="bg-[#9D00FF]/10 p-4 border-l-4 border-[#9D00FF] flex justify-between items-center -skew-x-2">
										<span className="text-[#9D00FF] font-bold uppercase text-xs tracking-widest">
											Registration Fee
										</span>
										<span className="text-2xl font-black text-white italic drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
											₹{selectedWorkshop.price}
										</span>
									</div>
								)}
							</div>

							{dialogMode === "register" && (
								<div className="flex flex-col gap-4">
									<PaymentButton
										amount={Math.round(
											Number.parseFloat(selectedWorkshop.price) * 100,
										)}
										workshopId={selectedWorkshop.id}
										onSuccess={() => {
											toast.success("Payment succeeded. Workshop registered!");
											setTimeout(() => {
												queryClient.invalidateQueries({
													queryKey: ["workshops"],
												});
												setSelectedWorkshop(null);
											}, 1000);
										}}
										description={`Workshop: ${selectedWorkshop.title}`}
									/>
									<p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-widest mt-2 flex flex-col">
										Payment is required for registration.
										<span>
											<a
												href="/terms-and-conditions"
												target="_blank"
												rel="noopener noreferrer"
												className="underline font-extrabold hover:text-[#9D00FF]"
											>
												Terms and Conditions
											</a>
											{" | "}
											<a
												href="/refund-policy"
												target="_blank"
												rel="noopener noreferrer"
												className="underline font-extrabold hover:text-[#9D00FF]"
											>
												Refund Policy
											</a>
										</span>
									</p>
								</div>
							)}
						</div>
					</div>,
					document.body,
				)}
		</div>
	);
}
