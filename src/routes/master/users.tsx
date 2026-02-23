import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getUserData, UserDataHeader } from "@/server/admin.master";

const masterUsersQueryOptions = queryOptions({
	queryKey: ["master", "users"],
	queryFn: () => getUserData(),
});

export const Route = createFileRoute("/master/users")({
	loader: async ({ context }) =>
		context.queryClient.ensureQueryData(masterUsersQueryOptions),
	component: RouteComponent,
});

function RouteComponent() {
	const { data: users } = useSuspenseQuery(masterUsersQueryOptions);

	return (
		<div className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
			<table className="min-w-full text-sm">
				<thead className="bg-muted/40">
					<tr>
						{UserDataHeader.map((header) => (
							<th key={header} className="px-3 py-2 text-left font-medium">
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{users.map((currentUser) => (
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
	);
}
