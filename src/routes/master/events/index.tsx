import { createFileRoute, Link } from "@tanstack/react-router";
import { getMasterEventsForPage } from "@/server/admin";

export const Route = createFileRoute("/master/events/")({
	loader: async () => getMasterEventsForPage(),
	component: RouteComponent,
});

function RouteComponent() {
	const events = Route.useLoaderData();

	return (
		<div className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
			<table className="min-w-full text-sm">
				<thead className="bg-muted/40">
					<tr>
						<th className="px-3 py-2 text-left font-medium">ID</th>
						<th className="px-3 py-2 text-left font-medium">Title</th>
						<th className="px-3 py-2 text-left font-medium">Location</th>
						<th className="px-3 py-2 text-left font-medium">Time</th>
						<th className="px-3 py-2 text-left font-medium">Registrations</th>
						<th className="px-3 py-2 text-left font-medium">Details</th>
					</tr>
				</thead>
				<tbody>
					{events.map((event) => (
						<tr key={event.id} className="border-t border-border">
							<td className="px-3 py-2 whitespace-nowrap">{event.id}</td>
							<td className="px-3 py-2 whitespace-nowrap">{event.title}</td>
							<td className="px-3 py-2 whitespace-nowrap">{event.location}</td>
							<td className="px-3 py-2 whitespace-nowrap">
								{event.time ? new Date(event.time).toLocaleString() : ""}
							</td>
							<td className="px-3 py-2 whitespace-nowrap">
								{event.registrationCount}
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
