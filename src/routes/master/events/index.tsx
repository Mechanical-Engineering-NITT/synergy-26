import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { requireAdminUser } from "@/lib/utils";
import { EventDataHeader, getEventData } from "@/server/admin/admin.master";

const masterEventsQueryOptions = queryOptions({
	queryKey: ["master", "events"],
	queryFn: () => getEventData(),
});

export const Route = createFileRoute("/master/events/")({
	loader: async () => {
		await requireAdminUser({ data: { roles: "ADMIN-MASTER" } });
	},
	component: RouteComponent,
});

function RouteComponent() {
	const {
		data: events,
		isLoading,
		isError,
	} = useQuery(masterEventsQueryOptions);

	if (isLoading) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				Loading events...
			</div>
		);
	}

	if (isError) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				Failed to load events.
			</div>
		);
	}

	if (!events) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				No events found.
			</div>
		);
	}

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
