import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { requireAdminUser } from "@/lib/utils";
import {
	getWorkshopData,
	WorkshopDataHeader,
} from "@/server/admin/admin.master";

const masterWorkshopsQueryOptions = queryOptions({
	queryKey: ["master", "workshops"],
	queryFn: () => getWorkshopData(),
});

export const Route = createFileRoute("/master/workshops/")({
	component: RouteComponent,
	loader: async () => {
		await requireAdminUser({ data: { roles: ["MASTER", "ADMIN"] } });
	},
});

function RouteComponent() {
	const {
		data: workshops,
		isLoading,
		isError,
	} = useQuery(masterWorkshopsQueryOptions);

	if (isLoading) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				Loading workshops...
			</div>
		);
	}

	if (isError) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				Failed to load workshops.
			</div>
		);
	}

	if (!workshops) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				No workshops found.
			</div>
		);
	}

	return (
		<div className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
			<table className="min-w-full text-sm">
				<thead className="bg-muted/40">
					<tr>
						{WorkshopDataHeader.map((header) => (
							<th key={header} className="px-3 py-2 text-left font-medium">
								{header}
							</th>
						))}
						<th className="px-3 py-2 text-left font-medium">Details</th>
					</tr>
				</thead>
				<tbody>
					{workshops.map((workshop) => (
						<tr key={workshop.id} className="border-t border-border">
							<td className="px-3 py-2 whitespace-nowrap">{workshop.id}</td>
							<td className="px-3 py-2 whitespace-nowrap">{workshop.title}</td>
							<td className="px-3 py-2 whitespace-nowrap">{workshop.price}</td>
							<td className="px-3 py-2 whitespace-nowrap">
								{workshop.registered_users}
							</td>
							<td className="px-3 py-2 whitespace-nowrap">
								<Link
									to="/master/workshops/$id"
									params={{ id: String(workshop.id) }}
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
