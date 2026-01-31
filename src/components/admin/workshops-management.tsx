import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { deleteWorkshop, getAllWorkshops } from "@/server/workshop";
import { CreateWorkshopForm } from "../forms/create-workshop";
import { EditWorkshopForm } from "../forms/edit-workshop";

export function WorkshopsManagement() {
	const queryClient = useQueryClient();
	const [editingId, setEditingId] = useState<number | null>(null);

	const { data: workshops = [], isLoading } = useQuery({
		queryKey: ["workshops"],
		queryFn: getAllWorkshops,
	});

	const deleteWorkshopMutation = useMutation({
		mutationFn: deleteWorkshop,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["workshops"] });
		},
	});

	if (isLoading) return <div>Loading workshops...</div>;

	const workshopToEdit = workshops.find((w) => w.id === editingId);

	return (
		<div className="space-y-8">
			<div>
				<h3 className="text-xl font-semibold mb-4">Create New Workshop</h3>
				<div className="bg-card p-4 rounded-lg border border-border">
					<CreateWorkshopForm />
				</div>
			</div>

			<div>
				<h3 className="text-xl font-semibold mb-4">
					Manage Workshops ({workshops.length})
				</h3>
				{workshops.length === 0 ? (
					<p className="text-muted-foreground">No workshops yet.</p>
				) : (
					<div className="space-y-4">
						{workshops.map((workshop) => (
							<div
								key={workshop.id}
								className="border border-border rounded-lg p-4 bg-card"
							>
								{editingId === workshop.id && workshopToEdit ? (
									<div className="space-y-4">
										<h4 className="text-lg font-semibold">Edit Workshop</h4>
										<EditWorkshopForm
											workshop={workshopToEdit}
											onSuccess={() => {
												setEditingId(null);
												queryClient.invalidateQueries({
													queryKey: ["workshops"],
												});
											}}
										/>
										<button
											type="button"
											onClick={() => setEditingId(null)}
											className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
										>
											Cancel
										</button>
									</div>
								) : (
									<>
										<h4 className="text-lg font-semibold">{workshop.title}</h4>
										<p className="text-sm text-muted-foreground">
											{workshop.description}
										</p>
										<div className="grid grid-cols-2 gap-2 mt-2 text-sm">
											<p>
												<span className="font-semibold">Time:</span>{" "}
												{new Date(workshop.time).toLocaleString()}
											</p>
											<p>
												<span className="font-semibold">Location:</span>{" "}
												{workshop.location}
											</p>
											<p>
												<span className="font-semibold">Price:</span>{" "}
												{workshop.price}
											</p>
										</div>
										<div className="flex gap-2 mt-4">
											<button
												type="button"
												onClick={() => setEditingId(workshop.id)}
												className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
											>
												Edit
											</button>
											<button
												type="button"
												onClick={() => {
													if (
														confirm(
															"Are you sure you want to delete this workshop?",
														)
													) {
														deleteWorkshopMutation.mutate({
															data: { id: workshop.id },
														});
													}
												}}
												disabled={deleteWorkshopMutation.isPending}
												className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
											>
												Delete
											</button>
										</div>
									</>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
