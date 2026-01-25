import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getAccommodationStatus } from "@/server/accommodation";
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
			<div className="p-6 text-center">Loading accommodation details...</div>
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
		<div className="p-6 max-w-4xl mx-auto">
			<h2 className="text-3xl font-bold mb-4 text-gray-800">Accommodation</h2>
			<div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition-shadow">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
					<div className="grow">
						<h3 className="text-xl font-bold text-gray-800 mb-2">
							Stay at NITT Campus
						</h3>
						<p className="text-gray-600 mb-4">
							Comfortable accommodation within the campus for festival
							participants.
						</p>
						<div className="flex flex-wrap gap-4 text-sm">
							<div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
								Price: ₹{roomPrice} / night
							</div>
							<div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium">
								Booked: {paidNights} / {maxNights} nights
							</div>
						</div>
					</div>
					<button
						type="button"
						onClick={handleOpenDialog}
						className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
						disabled={remainingNights <= 0}
					>
						{remainingNights <= 0 ? "Fully Booked" : "Book Accommodation"}
					</button>
				</div>
			</div>

			{isDialogOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
					<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
						<div className="flex justify-between items-start mb-6">
							<h3 className="text-2xl font-bold text-gray-800">
								Book Accommodation
							</h3>
							<button
								type="button"
								onClick={() => setIsDialogOpen(false)}
								className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
							>
								&times;
							</button>
						</div>

						<p className="text-gray-600 mb-6">
							Select the number of nights you wish to stay. You can book up to a
							total of {maxNights} nights.
						</p>

						<div className="space-y-4 mb-8">
							<span className="block text-sm font-semibold text-gray-700 mb-2">
								Number of Nights
							</span>
							<div className="flex items-center gap-4">
								{[...Array(remainingNights)].map((_, i) => {
									const nights = i + 1;
									return (
										<button
											key={nights}
											type="button"
											onClick={() => setSelectedNights(nights)}
											className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold transition-all ${
												selectedNights === nights
													? "border-blue-600 bg-blue-50 text-blue-600"
													: "border-gray-200 text-gray-600 hover:border-gray-300"
											}`}
										>
											{nights}
										</button>
									);
								})}
							</div>
							<p className="text-xs text-gray-500">
								Current status: {paidNights} nights paid. Remaining available:{" "}
								{remainingNights} nights.
							</p>
						</div>

						<div className="bg-gray-50 rounded-xl p-4 mb-8">
							<div className="flex justify-between items-center">
								<span className="text-gray-500">Total Price</span>
								<span className="text-2xl font-bold text-gray-800">
									₹{roomPrice * selectedNights}
								</span>
							</div>
						</div>

						<PaymentButton
							amount={roomPrice * selectedNights * 100}
							accommodation={selectedNights}
							onSuccess={() => {
								toast.success("Booking successful!");
								setIsDialogOpen(false);
								queryClient.invalidateQueries({
									queryKey: ["accommodationStatus"],
								});
							}}
							description="Accommodation"
						/>
					</div>
				</div>
			)}
		</div>
	);
}
