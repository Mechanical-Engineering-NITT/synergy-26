import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { getConstant } from "@/server/constants";
import { getAllEvents, registerForEvent } from "@/server/event";
import StatusSection from "../common/status-section";
import PaymentButton from "../payment/payment-button";

interface Event {
	id: number;
	title: string;
	description: string | null;
	longDescription: string | null;
	time: string;
	location: string | null;
	isRegistered: boolean;
}

function EventCard({
	event,
	isLoggedIn,
	hasEventPass,
	onViewDetails,
}: {
	event: Event;
	isLoggedIn: boolean;
	hasEventPass: boolean;
	onViewDetails: (event: Event) => void;
}) {
	const queryClient = useQueryClient();

	const { mutate: register, isPending: isRegistering } = useMutation({
		mutationFn: registerForEvent,
		onSuccess: () => {
			toast.success(`Registered for ${event.title} successfully!`);
			queryClient.invalidateQueries({ queryKey: ["events"] });
		},
		onError: (error) => {
			toast.error(`Registration failed: ${error.message}`);
		},
	});

	return (
		<div
			key={event.id}
			className="group relative bg-[#090521]/40 backdrop-blur-md border border-white/10 p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_30px_rgba(157,0,255,0.2)] hover:-translate-y-1 overflow-hidden"
		>
			{/* Animated Borders */}
			<div className="absolute top-0 left-0 w-0 h-0.5 bg-[#9D00FF] transition-all duration-500 group-hover:w-full"></div>
			<div className="absolute top-0 right-0 w-0.5 h-0 bg-[#9D00FF] transition-all duration-500 delay-100 group-hover:h-full"></div>
			<div className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#9D00FF] transition-all duration-500 delay-200 group-hover:w-full"></div>
			<div className="absolute bottom-0 left-0 w-0.5 h-0 bg-[#9D00FF] transition-all duration-500 delay-300 group-hover:h-full"></div>

			{/* Card Accent */}
			<div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-[#9D00FF]/20 to-transparent -translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>

			{/* Event Image */}
			<div className="relative aspect-video mb-6 overflow-hidden border border-white/10 group-hover:border-[#9D00FF]/50 transition-all duration-500">
				<img
					src={`/events/${event.id}.webp`}
					alt={event.title}
					className="w-full h-full object-fill transition-transform duration-700 group-hover:scale-105"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-[#090521] via-transparent to-transparent opacity-80"></div>
			</div>

			<div className="mb-4">
				<h2 className="text-xl font-black text-white uppercase italic tracking-wider group-hover:text-[#FFDD00] transition-colors drop-shadow-[0_0_5px_rgba(157,0,255,0.5)]">
					{event.title}
				</h2>
				<div className="h-0.5 w-12 bg-[#9D00FF] mt-1 transition-all group-hover:w-full duration-500 shadow-[0_0_5px_rgba(157,0,255,0.8)]"></div>
			</div>

			<p className="text-gray-300 text-sm mb-6 line-clamp-3 font-medium leading-relaxed uppercase tracking-tight">
				{event.description}
			</p>

			<div className="space-y-3 mb-8 grow">
				<div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#9D00FF]">
					<span className="w-1 h-1 bg-[#FFDD00] shadow-[0_0_5px_rgba(255,221,0,0.8)]"></span>
					<span className="text-gray-500">TIME:</span>
					<span className="text-white">{event.time}</span>
				</div>
				<div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#9D00FF]">
					<span className="w-1 h-1 bg-[#FFDD00] shadow-[0_0_5px_rgba(255,221,0,0.8)]"></span>
					<span className="text-gray-500">LOC:</span>
					<span className="text-white">{event.location}</span>
				</div>
			</div>

			<div className="flex flex-col gap-3 mt-auto pt-6 border-t border-white/5">
				<button
					type="button"
					onClick={() => onViewDetails(event)}
					className="w-full py-2 text-xs font-black uppercase tracking-[0.2em] border border-white/20 hover:bg-white hover:text-black transition-all duration-300 -skew-x-6"
				>
					View Details
				</button>
				<button
					type="button"
					onClick={() => {
						if (!isLoggedIn) {
							toast.error("Please sign in to register");
							return;
						}
						if (!hasEventPass) {
							toast.error("You need an Event Pass to register!");
							return;
						}
						register({ data: { eventId: event.id } });
					}}
					disabled={isRegistering || event.isRegistered}
					className={`w-full py-3 text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 -skew-x-6 flex items-center justify-center gap-2
                        ${
													event.isRegistered
														? "bg-[#9D00FF]/20 text-[#FFDD00] border border-[#9D00FF]/50"
														: "bg-[#FFDD00] text-black hover:bg-[#FFDD00] shadow-[4px_4px_0px_0px_rgba(157,0,255,1)] hover:translate-x-0.5 hover:translate-y-0.5"
												}
                        disabled:opacity-50`}
				>
					{isRegistering ? (
						"Processing..."
					) : event.isRegistered ? (
						<>
							<span className="text-[10px]">●</span> REGISTERED
						</>
					) : (
						"REGISTER"
					)}
				</button>
			</div>
		</div>
	);
}

export default function Events({ isLoggedIn }: { isLoggedIn: boolean }) {
	const queryClient = useQueryClient();
	const [isPassDialogOpen, setIsPassDialogOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

	const {
		isPending: isEventsPending,
		isError: isEventsError,
		data: eventsData,
		error: eventsError,
	} = useQuery({
		queryKey: ["events"],
		queryFn: getAllEvents,
	});

	// Ignore pre-fest event
	const events =
		(eventsData?.events as Event[] | undefined)?.filter((e) => e.id !== 8) ??
		[];
	const hasEventPass = eventsData?.hasEventPass || false;

	const { data: passPriceStr, isLoading: isPriceLoading } = useQuery({
		queryKey: ["constant", "event_pass"],
		queryFn: () => getConstant({ data: { key: "event_pass" } }),
	});

	const passPrice = passPriceStr
		? Math.round(Number.parseFloat(passPriceStr) * 100)
		: 6942000;

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

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setSelectedEvent(null);
				setIsPassDialogOpen(false);
			}
		};

		if (selectedEvent || isPassDialogOpen) {
			document.body.style.overflow = "hidden";
			window.addEventListener("keydown", handleEscape);
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
			window.removeEventListener("keydown", handleEscape);
		};
	}, [selectedEvent, isPassDialogOpen]);

	if (isEventsPending) {
		return <StatusSection type="loading" />;
	}
	if (isEventsError) {
		return (
			<StatusSection
				type="error"
				message={`Error loading events: ${eventsError instanceof Error ? eventsError.message : String(eventsError)}`}
				onRetry={() => queryClient.invalidateQueries({ queryKey: ["events"] })}
			/>
		);
	}

	return (
		// biome-ignore lint: Static ID is required for anchor scrolling from Hero section
		<div
			id="events"
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
					Events
				</h1>
				<p
					className="text-center text-[#FFDD00] font-bold tracking-widest uppercase mb-12 drop-shadow-[0_0_10px_rgba(255,221,0,0.8)]"
					style={{ fontFamily: "monospace" }}
				>
					Access your destiny
				</p>

				<div className="relative">
					{events.length === 0 ? (
						<div className="text-center py-20 bg-white/5 border border-white/10 backdrop-blur-sm -skew-x-2">
							<p className="text-[#9D00FF] font-black uppercase tracking-[0.3em] animate-pulse">
								Scanning for events... No signals found.
							</p>
						</div>
					) : (
						<div className="relative group/carousel">
							<div className="overflow-hidden py-4" ref={emblaRef}>
								<div className="flex -ml-6">
									{events.map((event) => (
										<div
											key={event.id}
											className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-6 min-w-0"
										>
											<EventCard
												event={event}
												isLoggedIn={isLoggedIn}
												hasEventPass={hasEventPass}
												onViewDetails={setSelectedEvent}
											/>
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

				{!hasEventPass && (
					<div className="my-5 relative group bg-[#090521]/60 backdrop-blur-md border-2 border-[#FFDD00] -skew-x-3 p-8 text-white shadow-[10px_10px_0px_0px_rgba(157,0,255,0.5)] overflow-hidden hover:shadow-[15px_15px_0px_0px_rgba(157,0,255,0.6)] transition-all">
						{/* Animated scanline effect */}
						<div className="absolute inset-0 bg-linear-to-b from-transparent via-white/10 to-transparent h-1/2 w-full -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out"></div>

						<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
							<div className="text-center md:text-left">
								<h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2 text-[#9D00FF] drop-shadow-[0_0_5px_rgba(157,0,255,0.8)]">
									Event Pass
								</h2>
								<p className="max-w-md opacity-90 font-medium">
									Get access to all events with a single pass! Experience the
									ultimate synergy.{" "}
									<span className="text-[#FFDD00] font-bold">
										IMPORTANT NOTE: ANY WORKSHOP REGISTRATION WILL GIVE ACCESS
										TO FREE EVENT PASS.
									</span>
								</p>
							</div>
							<button
								type="button"
								onClick={() => {
									if (!isLoggedIn) {
										toast.error("Please sign in to get event pass");
										return;
									}
									setIsPassDialogOpen(true);
								}}
								className="group relative px-8 py-4 bg-[#FFDD00] hover:bg-[#FFDD00] text-black font-black text-xl -skew-x-12 shadow-[5px_5px_0px_0px_rgba(157,0,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(157,0,255,1)] transition-all hover:translate-y-1 active:translate-y-2 overflow-hidden w-full md:w-auto"
							>
								<span className="relative z-10 block skew-x-12 uppercase">
									Get Event Pass
								</span>
								<div className="absolute inset-0 bg-white/40 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
							</button>
						</div>
					</div>
				)}
			</div>

			{isPassDialogOpen &&
				createPortal(
					<div className="fixed h-full w-full inset-0 flex items-center justify-center z-9999 p-4 animate-in fade-in duration-300">
						{/* Backdrop Button */}
						<button
							type="button"
							onClick={() => setIsPassDialogOpen(false)}
							className="absolute inset-0 w-full h-full bg-black/90 backdrop-blur-md cursor-pointer border-none"
							aria-label="Close dialog"
						/>
						<div className="bg-[#090521] border-2 border-[#9D00FF] shadow-[0_0_80px_rgba(157,0,255,0.4)] max-w-md w-full max-h-[90vh] overflow-y-auto p-8 animate-in zoom-in-95 duration-300 relative z-9999 overscroll-behavior-contain custom-scrollbar">
							{/* Corner Accents */}
							<div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FFDD00]"></div>
							<div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FFDD00]"></div>
							<div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FFDD00]"></div>
							<div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FFDD00]"></div>

							<div className="flex justify-between items-start mb-6">
								<h3 className="text-2xl font-black uppercase italic tracking-widest bg-clip-text text-transparent bg-linear-to-r from-[#9D00FF] to-[#9D00FF]">
									Event Pass
								</h3>
								<button
									type="button"
									onClick={() => setIsPassDialogOpen(false)}
									className="text-[#9D00FF] hover:text-[#FFDD00] transition-colors text-2xl font-bold leading-none"
								>
									&times;
								</button>
							</div>

							<div className="space-y-4 mb-8">
								{[
									"Access to all events",
									"Certificates for all participating events",
								].map((text) => (
									<div key={text} className="flex items-center gap-3 group">
										<div className="w-5 h-5 border border-[#9D00FF] flex items-center justify-center font-bold text-[10px] text-[#9D00FF] group-hover:bg-[#9D00FF] group-hover:text-black transition-colors shadow-[0_0_10px_rgba(157,0,255,0.4)]">
											X
										</div>
										<p className="text-gray-300 font-medium tracking-wide uppercase text-xs group-hover:text-white transition-colors">
											{text}
										</p>
									</div>
								))}
							</div>

							<div className="bg-white/5 border border-white/10 p-5 mb-8 -skew-x-2">
								<div className="flex justify-between items-center bg-[#9D00FF]/10 p-2 border-l-4 border-[#9D00FF]">
									<span className="text-[#9D00FF] font-bold uppercase text-xs tracking-widest">
										PRICE
									</span>
									<span className="text-2xl font-black text-white italic drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
										₹
										{(passPrice / 100).toLocaleString(undefined, {
											minimumFractionDigits: 0,
											maximumFractionDigits: 2,
										})}
									</span>
								</div>
							</div>

							<div className="flex flex-col gap-4">
								<PaymentButton
									amount={passPrice}
									isEventPass={true}
									onSuccess={() => {
										toast.success("Event Pass purchased successfully!");
										setTimeout(() => {
											queryClient.invalidateQueries({
												queryKey: ["events"],
											});
											setIsPassDialogOpen(false);
										}, 1000);
									}}
									disabled={isPriceLoading}
									description="Event Pass"
								/>
								<p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-widest mt-2">
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
						</div>
					</div>,
					document.body,
				)}

			{selectedEvent &&
				createPortal(
					<div className="fixed inset-0 flex items-center justify-center z-9999 p-4 animate-in fade-in duration-300">
						{/* Backdrop Button */}
						<button
							type="button"
							onClick={() => setSelectedEvent(null)}
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
									{selectedEvent.title}
								</h3>
								<button
									type="button"
									onClick={() => setSelectedEvent(null)}
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
										{selectedEvent.description}
									</p>
								</div>

								{selectedEvent.longDescription && (
									<div>
										<h4 className="text-[#9D00FF] text-xs font-black uppercase tracking-[0.2em] mb-2 drop-shadow-[0_0_5px_rgba(157,0,255,0.5)]">
											Details
										</h4>
										<p className="text-gray-300 text-sm leading-relaxed uppercase tracking-tight whitespace-pre-wrap">
											{selectedEvent.longDescription}
										</p>
									</div>
								)}

								<div className="grid grid-cols-2 gap-4">
									<div className="bg-white/5 border border-white/10 p-3">
										<p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
											Time
										</p>
										<p className="text-xs text-white font-black uppercase">
											{selectedEvent.time}
										</p>
									</div>
									<div className="bg-white/5 border border-white/10 p-3">
										<p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
											Location
										</p>
										<p className="text-xs text-white font-black uppercase">
											{selectedEvent.location}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</div>
	);
}
