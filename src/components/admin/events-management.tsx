import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CreateEventForm } from "@/components/forms/create-event";
import { EditEventForm } from "@/components/forms/edit-event";
import { deleteEvent, getAllEvents } from "@/server/event";

export function EventsManagement() {
	const queryClient = useQueryClient();
	const [editingId, setEditingId] = useState<number | null>(null);

	const { data: events = { events: [] }, isLoading } = useQuery({
		queryKey: ["events"],
		queryFn: getAllEvents,
	});

	const deleteEventMutation = useMutation({
		mutationFn: deleteEvent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["events"] });
		},
	});

	if (isLoading) return <div>Loading events...</div>;

	const eventToEdit = events.events.find((e) => e.id === editingId);

	return (
		<div className="space-y-8">
			<div>
				<h3 className="text-xl font-semibold mb-4">Create New Event</h3>
				<div className="bg-card p-4 rounded-lg border border-border">
					<CreateEventForm />
				</div>
			</div>

			<div>
				<h3 className="text-xl font-semibold mb-4">
					Manage Events ({events.events.length})
				</h3>
				{events.events.length === 0 ? (
					<p className="text-muted-foreground">No events yet.</p>
				) : (
					<div className="space-y-4">
						{events.events.map((event) => (
							<div
								key={event.id}
								className="border border-border rounded-lg p-4 bg-card"
							>
								{editingId === event.id && eventToEdit ? (
									<div className="space-y-4">
										<h4 className="text-lg font-semibold">Edit Event</h4>
										<EditEventForm
											event={eventToEdit}
											onSuccess={() => {
												setEditingId(null);
												queryClient.invalidateQueries({ queryKey: ["events"] });
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
										<h4 className="text-lg font-semibold">{event.title}</h4>
										<p className="text-sm text-muted-foreground">
											{event.description}
										</p>
										<div className="grid grid-cols-2 gap-2 mt-2 text-sm">
											<p>
												<span className="font-semibold">Time:</span>{" "}
												{new Date(event.time).toLocaleString()}
											</p>
											<p>
												<span className="font-semibold">Location:</span>{" "}
												{event.location}
											</p>
										</div>
										<div className="flex gap-2 mt-4">
											<button
												type="button"
												onClick={() => setEditingId(event.id)}
												className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
											>
												Edit
											</button>
											<button
												type="button"
												onClick={() => {
													if (
														confirm(
															"Are you sure you want to delete this event?",
														)
													) {
														deleteEventMutation.mutate({
															data: { id: event.id },
														});
													}
												}}
												disabled={deleteEventMutation.isPending}
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
