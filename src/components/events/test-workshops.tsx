import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAllWorkshops, registerForWorkshop } from "@/server/workshop";
import PaymentButton from "../payment/payment-button";

export default function WorkshopsTest({ isLoggedIn }: { isLoggedIn: boolean }) {
	const queryClient = useQueryClient();
	const {
		isPending,
		isError,
		data: workshops,
		error,
	} = useQuery({
		queryKey: ["workshops"],
		queryFn: getAllWorkshops,
	});

	const { mutate: register, isPending: isRegistering } = useMutation({
		mutationFn: registerForWorkshop,
		onSuccess: () => {
			toast.success("Registered successfully!");
			queryClient.invalidateQueries({ queryKey: ["workshops"] });
		},
		onError: (error) => {
			toast.error(`Registration failed: ${error.message}`);
		},
	});

	if (isPending) {
		return <div>Loading workshops...</div>;
	}
	if (isError) {
		return <div>Error loading workshops: {String(error)}</div>;
	}

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-3xl font-bold mb-4 text-gray-800">
				Workshops Test Component
			</h1>
			<p className="text-gray-600 mb-8">
				This is a test component for workshops.
			</p>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{workshops.length === 0 ? (
					<p className="col-span-full text-center text-gray-500 py-12">
						No workshops available.
					</p>
				) : (
					workshops.map((workshop) => (
						<div
							key={workshop.id}
							className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow flex flex-col"
						>
							<h2 className="text-xl font-bold text-gray-800 mb-2">
								{workshop.title}
							</h2>
							<p className="text-gray-600 mb-4 line-clamp-2">
								{workshop.description}
							</p>
							<div className="space-y-2 text-sm text-gray-500 mb-6 grow">
								<p className="flex items-center gap-2">
									<span className="font-semibold">Time:</span>{" "}
									{new Date(workshop.time).toLocaleString()}
								</p>
								<p className="flex items-center gap-2">
									<span className="font-semibold">Location:</span>{" "}
									{workshop.location}
								</p>
								<p className="flex items-center gap-2">
									<span className="font-semibold">Price:</span> {workshop.price}
								</p>
							</div>
							<div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-50 uppercase">
								{!workshop.isPaid ? (
									<PaymentButton
										amount={Number.parseInt(workshop.price, 10) * 100}
										workshopId={workshop.id}
										onSuccess={() => {
											toast.success("Workshop paid!");
											queryClient.invalidateQueries({
												queryKey: ["workshops"],
											});
										}}
										description={`Workshop: ${workshop.title}`}
									/>
								) : (
									<div className="text-sm font-semibold text-green-600 mb-2">
										Paid ✓
									</div>
								)}
								<button
									type="button"
									onClick={() => {
										if (!isLoggedIn) {
											toast.error("Please sign in to register");
											return;
										}
										if (!workshop.isPaid) {
											toast.error("You must pay for this workshop first!");
											return;
										}
										register({ data: { workshopId: workshop.id } });
									}}
									disabled={isRegistering || workshop.isRegistered}
									className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
								>
									{isRegistering
										? "Registering..."
										: workshop.isRegistered
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
