import { createFileRoute } from "@tanstack/react-router";
import { getMasterEventDetailForPage } from "@/server/admin";

export const Route = createFileRoute("/master/events/$id")({
	loader: async ({ params }) => {
		const eventId = Number(params.id);
		if (Number.isNaN(eventId)) {
			throw new Error("Invalid event id");
		}

		const reportingData = await getMasterEventDetailForPage({
			data: { eventId },
		});

		return {
			event: reportingData.event,
			registeredUsers: reportingData.registeredUsers,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const data = Route.useLoaderData();

	return (
		<div className="mt-6 space-y-6">
			<div>
				<h2 className="text-2xl font-semibold">{data.event.title}</h2>
				<p className="text-sm text-muted-foreground">
					{data.event.description}
				</p>
			</div>

			<section>
				<h3 className="text-lg font-medium mb-3">
					Registered Users ({data.registeredUsers.length})
				</h3>
				<div className="overflow-x-auto rounded-md border border-border bg-card">
					<table className="min-w-full text-sm">
						<thead className="bg-muted/40">
							<tr>
								<th className="px-3 py-2 text-left font-medium">User ID</th>
								<th className="px-3 py-2 text-left font-medium">Name</th>
								<th className="px-3 py-2 text-left font-medium">Email</th>
								<th className="px-3 py-2 text-left font-medium">Role</th>
								<th className="px-3 py-2 text-left font-medium">Onboarded</th>
								<th className="px-3 py-2 text-left font-medium">Full Name</th>
								<th className="px-3 py-2 text-left font-medium">Phone</th>
								<th className="px-3 py-2 text-left font-medium">College</th>
								<th className="px-3 py-2 text-left font-medium">City</th>
								<th className="px-3 py-2 text-left font-medium">Department</th>
								<th className="px-3 py-2 text-left font-medium">Year</th>
								<th className="px-3 py-2 text-left font-medium">Gender</th>
								<th className="px-3 py-2 text-left font-medium">
									Email Verified
								</th>
								<th className="px-3 py-2 text-left font-medium">Created At</th>
							</tr>
						</thead>
						<tbody>
							{data.registeredUsers.map((currentUser) => (
								<tr key={currentUser.id} className="border-t border-border">
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.id}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.name}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.email}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.role}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.onBoardingComplete ? "yes" : "no"}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.profile?.fullname ?? ""}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.profile?.phone ?? ""}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.profile?.college ?? ""}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.profile?.city ?? ""}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.profile?.department ?? ""}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.profile?.year ?? ""}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.profile?.gender ?? ""}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.emailVerified ? "yes" : "no"}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{currentUser.createdAt
											? new Date(currentUser.createdAt).toLocaleString()
											: ""}
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
