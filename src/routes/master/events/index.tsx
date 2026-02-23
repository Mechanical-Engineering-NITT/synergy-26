import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EventDataHeader, getEventData } from "@/server/admin.master";

const masterEventsQueryOptions = queryOptions({
	queryKey: ["master", "events"],
	queryFn: () => getEventData(),
});

export const Route = createFileRoute("/master/events/")({
	loader: async ({ context }) =>
		context.queryClient.ensureQueryData(masterEventsQueryOptions),
	component: RouteComponent,
});

function RouteComponent() {
	const { data: events } = useSuspenseQuery(masterEventsQueryOptions);

	return (
		<div className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
			<table className="min-w-full text-sm">
				<thead className="bg-muted/40">
					<tr>
						{EventDataHeader.map((header) => (
							<th key={header} className="px-3 py-2 text-left font-medium">
								{header}
							</th>
						))}
						<th className="px-3 py-2 text-left font-medium">Details</th>
					</tr>
				</thead>
				<tbody>
					{events.map((event) => (
						<tr key={event.id} className="border-t border-border">
							<td className="px-3 py-2 whitespace-nowrap">{event.id}</td>
							<td className="px-3 py-2 whitespace-nowrap">{event.title}</td>
							<td className="px-3 py-2 whitespace-nowrap">
								{event.time ? new Date(event.time).toLocaleString() : ""}
							</td>
							<td className="px-3 py-2 whitespace-nowrap">
								{event.registered_users}
							</td>
							<td className="px-3 py-2 whitespace-nowrap">
								<Link
									to="/master/events/$id"
									params={{ id: String(event.id) }}
									className="text-primary underline-offset-4 hover:underline"
								>
									View
								</Link>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
