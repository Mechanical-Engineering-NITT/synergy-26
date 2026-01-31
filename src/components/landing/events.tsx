import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getConstant } from "@/server/constants";
import { getAllEvents, registerForEvent } from "@/server/event";
import StatusSection from "../common/status-section";
import PaymentButton from "../payment/payment-button";

interface Event {
	id: number;
	title: string;
	description: string | null;
	time: Date;
	location: string | null;
	isRegistered: boolean;
}

function EventCard({
	event,
	isLoggedIn,
	hasEventPass,
}: {
	event: Event;
	isLoggedIn: boolean;
	hasEventPass: boolean;
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
			className="group relative bg-zinc-900/40 backdrop-blur-md border border-white/10 p-6 flex flex-col transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:-translate-y-1 overflow-hidden"
		>
			{/* Card Accent */}
			<div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-cyan-500/10 to-transparent -translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>

			<div className="mb-4">
				<h2 className="text-xl font-black text-white uppercase italic tracking-wider group-hover:text-cyan-400 transition-colors">
					{event.title}
				</h2>
				<div className="h-0.5 w-12 bg-amber-400 mt-1 transition-all group-hover:w-full duration-500"></div>
			</div>

			<p className="text-gray-400 text-sm mb-6 line-clamp-3 font-medium leading-relaxed uppercase tracking-tight">
				{event.description}
			</p>

			<div className="space-y-3 mb-8 grow">
				<div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-cyan-400/70">
					<span className="w-1 h-1 bg-cyan-400"></span>
					<span className="text-gray-500">TIME:</span>
					<span className="text-white">
						{new Date(event.time).toLocaleString()}
					</span>
				</div>
				<div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-cyan-400/70">
					<span className="w-1 h-1 bg-cyan-400"></span>
					<span className="text-gray-500">LOC:</span>
					<span className="text-white">{event.location}</span>
				</div>
			</div>

			<div className="flex flex-col gap-3 mt-auto pt-6 border-t border-white/5">
				<button
					type="button"
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
														? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
														: "bg-amber-400 text-black hover:bg-amber-300 shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] hover:translate-x-0.5 hover:translate-y-0.5"
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

	const {
		isPending: isEventsPending,
		isError: isEventsError,
		data: eventsData,
		error: eventsError,
	} = useQuery({
		queryKey: ["events"],
		queryFn: getAllEvents,
	});

	const events = (eventsData?.events as Event[]) || [];
	const hasEventPass = eventsData?.hasEventPass || false;

	const { data: passPriceStr, isLoading: isPriceLoading } = useQuery({
		queryKey: ["constant", "event_pass"],
		queryFn: () => getConstant({ data: { key: "event_pass" } }),
	});

	const passPrice = passPriceStr
		? Number.parseInt(passPriceStr, 10) * 100
		: 6942000;

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
		<div className="min-h-screen bg-black overflow-hidden relative font-sans text-white selection:bg-fuchsia-500/30">
			{/* 1. Starry Background Layer */}
			<div className="absolute inset-0 bg-black z-0">
				<div className="absolute inset-0 opacity-70 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
			</div>

			{/* 2. Retro Sun Section (Smaller and shifted for content) */}
			<div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-linear-to-t from-yellow-400 via-pink-500 to-purple-600 blur-sm z-10 shadow-[0_0_50px_rgba(236,72,153,0.5)] opacity-50"></div>

			<div className="relative z-30 p-6 max-w-6xl mx-auto py-20">
				<h1
					className="text-4xl sm:text-6xl font-black italic tracking-wider text-transparent bg-clip-text bg-linear-to-b from-red-950 via-red-900 to-red-800 drop-shadow-[0_0_20px_rgba(254,243,199,0.3)] mb-2 uppercase text-center"
					style={{
						WebkitTextStroke: "1px rgba(255,255,255,0.05)",
						textShadow: "2px 2px 0px #fef3c7",
					}}
				>
					Events
				</h1>
				<p
					className="text-center text-yellow-300 font-bold tracking-widest uppercase mb-12"
					style={{ fontFamily: "monospace" }}
				>
					Access your destiny
				</p>

				{!hasEventPass && (
					<div className="relative group bg-zinc-900/50 backdrop-blur-md border-2 border-amber-400 -skew-x-3 p-8 text-white mb-16 shadow-[10px_10px_0px_0px_rgba(34,211,238,0.5)] overflow-hidden">
						{/* Animated scanline effect */}
						<div className="absolute inset-0 bg-linear-to-b from-transparent via-white/5 to-transparent h-1/2 w-full -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out"></div>

						<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
							<div className="text-center md:text-left">
								<h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2 text-cyan-400">
									Event Pass
								</h2>
								<p className="max-w-md opacity-90 font-medium">
									Get access to all events with a single pass! Experience the
									ultimate synergy.
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
								className="group relative px-8 py-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-xl -skew-x-12 shadow-[5px_5px_0px_0px_rgba(34,211,238,1)] transition-transform hover:translate-y-1 active:translate-y-2 overflow-hidden w-full md:w-auto"
							>
								<span className="relative z-10 block skew-x-12 uppercase">
									Get Event Pass
								</span>
								<div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
							</button>
						</div>
					</div>
				)}

				{isPassDialogOpen && (
					<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
						<div className="bg-zinc-950 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(34,211,238,0.2)] max-w-md w-full p-8 animate-in zoom-in-95 duration-300 relative">
							{/* Corner Accents */}
							<div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
							<div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
							<div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
							<div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

							<div className="flex justify-between items-start mb-6">
								<h3 className="text-2xl font-black uppercase italic tracking-widest bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-blue-500">
									Event Pass
								</h3>
								<button
									type="button"
									onClick={() => setIsPassDialogOpen(false)}
									className="text-cyan-400 hover:text-white transition-colors text-2xl font-bold leading-none"
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
										<div className="w-5 h-5 border border-cyan-500/50 flex items-center justify-center font-bold text-[10px] text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-colors">
											X
										</div>
										<p className="text-gray-300 font-medium tracking-wide uppercase text-xs">
											{text}
										</p>
									</div>
								))}
							</div>

							<div className="bg-white/5 border border-white/10 p-5 mb-8 -skew-x-2">
								<div className="flex justify-between items-center bg-cyan-500/10 p-2 border-l-4 border-cyan-400">
									<span className="text-cyan-400 font-bold uppercase text-xs tracking-widest">
										PRICE
									</span>
									<span className="text-2xl font-black text-white italic">
										₹{passPrice / 100}
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
							</div>
						</div>
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{events.length === 0 ? (
						<div className="col-span-full text-center py-20 bg-white/5 border border-white/10 backdrop-blur-sm -skew-x-2">
							<p className="text-cyan-400 font-black uppercase tracking-[0.3em] animate-pulse">
								Scanning for events... No signals found.
							</p>
						</div>
					) : (
						events.map((event) => (
							<EventCard
								key={event.id}
								event={event}
								isLoggedIn={isLoggedIn}
								hasEventPass={hasEventPass}
							/>
						))
					)}
				</div>
			</div>
		</div>
	);
}
