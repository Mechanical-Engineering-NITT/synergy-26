import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	EventDataHeader,
	getEventData,
	getUserDataByEventId,
	UserDataByEventIdHeader,
} from "@/server/admin.master";

const masterEventsQueryOptions = queryOptions({
	queryKey: ["master", "events"],
	queryFn: () => getEventData(),
});

const masterUsersByEventQueryOptions = (eventId: number) =>
	queryOptions({
		queryKey: ["master", "event-users", eventId],
		queryFn: () => getUserDataByEventId({ data: { eventId } }),
	});

export const Route = createFileRoute("/master/events/$id")({
	loader: async ({ params, context }) => {
		const eventId = Number(params.id);
		if (Number.isNaN(eventId)) {
			throw new Error("Invalid event id");
		}

		await context.queryClient.ensureQueryData(masterEventsQueryOptions);
		await context.queryClient.ensureQueryData(
			masterUsersByEventQueryOptions(eventId),
		);

		return { eventId };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { eventId } = Route.useLoaderData();
	const { data: events } = useSuspenseQuery(masterEventsQueryOptions);
	const { data: registeredUsers } = useSuspenseQuery(
		masterUsersByEventQueryOptions(eventId),
	);

	const event = events.find((currentEvent) => currentEvent.id === eventId);

	if (!event) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				No event found.
			</div>
		);
	}

	return (
		<div className="mt-6 space-y-6">
			<div>
				<h2 className="text-2xl font-semibold">{event.title}</h2>
				<p className="text-sm text-muted-foreground">
					{event.time ? new Date(event.time).toLocaleString() : ""}
				</p>
			</div>

			<section>
				<h3 className="mb-3 text-lg font-medium">Event Details</h3>
				<div className="overflow-x-auto rounded-md border border-border bg-card">
					<table className="min-w-full text-sm">
						<thead className="bg-muted/40">
							<tr>
								{EventDataHeader.map((header) => (
									<th key={header} className="px-3 py-2 text-left font-medium">
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							<tr className="border-t border-border">
								<td className="px-3 py-2 whitespace-nowrap">{event.id}</td>
								<td className="px-3 py-2 whitespace-nowrap">{event.title}</td>
								<td className="px-3 py-2 whitespace-nowrap">
									{event.time ? new Date(event.time).toLocaleString() : ""}
								</td>
								<td className="px-3 py-2 whitespace-nowrap">
									{event.registered_users}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			<section>
				<h3 className="mb-3 text-lg font-medium">
					Registered Users ({registeredUsers.length})
				</h3>
				<div className="overflow-x-auto rounded-md border border-border bg-card">
					<table className="min-w-full text-sm">
						<thead className="bg-muted/40">
							<tr>
								{UserDataByEventIdHeader.map((header) => (
									<th key={header} className="px-3 py-2 text-left font-medium">
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{registeredUsers.map((currentUser) => (
								<tr key={currentUser.userId} className="border-t border-border">
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.userId}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.email}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.fullname ?? ""}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.phone ?? ""}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.college ?? ""}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.city ?? ""}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.year ?? ""}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.department ?? ""}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}
