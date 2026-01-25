import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getConstant } from "@/server/constants";
import { getAllEvents, registerForEvent } from "@/server/event";
import PaymentButton from "../payment/payment-button";

export default function EventsTest({ isLoggedIn }: { isLoggedIn: boolean }) {
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

	const events = eventsData?.events || [];
	const hasEventPass = eventsData?.hasEventPass || false;

	const { data: passPriceStr, isLoading: isPriceLoading } = useQuery({
		queryKey: ["constant", "event_pass"],
		queryFn: () => getConstant({ data: { key: "event_pass" } }),
	});

	const passPrice = passPriceStr
		? Number.parseInt(passPriceStr, 10) * 100
		: 6942000;

	const { mutate: register, isPending: isRegistering } = useMutation({
		mutationFn: registerForEvent,
		onSuccess: () => {
			toast.success("Registered successfully!");
			queryClient.invalidateQueries({ queryKey: ["events"] });
		},
		onError: (error) => {
			toast.error(`Registration failed: ${error.message}`);
		},
	});

	if (isEventsPending) {
		return <div>Loading events...</div>;
	}
	if (isEventsError) {
		return <div>Error loading events: {String(eventsError)}</div>;
	}

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-3xl font-bold mb-4 text-gray-800">
				Events Test Component
			</h1>
			<p className="text-gray-600 mb-8">This is a test component for events.</p>

			{!hasEventPass && (
				<div className="bg-linear-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white mb-12 shadow-lg">
					<h2 className="text-2xl font-bold mb-2">Exclusive Event Pass</h2>
					<p className="mb-6 opacity-90">
						Get access to all events with a single pass! Special perks and
						priority seating included.
					</p>
					<button
						type="button"
						onClick={() => setIsPassDialogOpen(true)}
						className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors shadow-md"
					>
						Get Event Pass
					</button>
				</div>
			)}

			{isPassDialogOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
					<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
						<div className="flex justify-between items-start mb-6">
							<h3 className="text-2xl font-bold text-gray-800">
								Synergy Event Pass
							</h3>
							<button
								type="button"
								onClick={() => setIsPassDialogOpen(false)}
								className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
							>
								&times;
							</button>
						</div>

						<div className="space-y-4 mb-8">
							<div className="flex items-center gap-3">
								<div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs">
									✓
								</div>
								<p className="text-gray-600">Access to all 20+ workshops</p>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs">
									✓
								</div>
								<p className="text-gray-600">Entry to all mainstage events</p>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs">
									✓
								</div>
								<p className="text-gray-600">Exclusive networking sessions</p>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs">
									✓
								</div>
								<p className="text-gray-600">Official event merchandise kit</p>
							</div>
						</div>

						<div className="bg-gray-50 rounded-xl p-4 mb-8">
							<div className="flex justify-between items-center">
								<span className="text-gray-500">Total Price</span>
								<span className="text-2xl font-bold text-gray-800">
									₹{passPrice / 100}
								</span>
							</div>
						</div>

						<PaymentButton
							amount={passPrice}
							isEventPass={true}
							onSuccess={(res) => {
								console.log("Pass purchased!", res);
							}}
							disabled={isPriceLoading}
							description="Event Pass"
						/>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{events.length === 0 ? (
					<p className="col-span-full text-center text-gray-500 py-12">
						No events available.
					</p>
				) : (
					events.map((event) => (
						<div
							key={event.id}
							className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow flex flex-col"
						>
							<h2 className="text-xl font-bold text-gray-800 mb-2">
								{event.title}
							</h2>
							<p className="text-gray-600 mb-4 line-clamp-2">
								{event.description}
							</p>
							<div className="space-y-2 text-sm text-gray-500 mb-6 grow">
								<p className="flex items-center gap-2">
									<span className="font-semibold">Time:</span>{" "}
									{new Date(event.time).toLocaleString()}
								</p>
								<p className="flex items-center gap-2">
									<span className="font-semibold">Location:</span>{" "}
									{event.location}
								</p>
							</div>
							<div className="flex items-center justify-end mt-auto pt-4 border-t border-gray-50">
								<button
									type="button"
									className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
									className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
								>
									{isRegistering
										? "Registering..."
										: event.isRegistered
											? "Registered"
											: "Register"}
								</button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
