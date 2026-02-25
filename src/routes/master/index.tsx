import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { requireAdminUser } from "@/lib/utils";

export const Route = createFileRoute("/master/")({
	loader: async () => {
		await requireAdminUser({ data: { roles: "ADMIN-MASTER" } });
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="min-h-screen bg-background text-foreground p-6">
			<div className="mx-auto max-w-6xl space-y-6">
				<h1 className="text-3xl font-semibold">Master</h1>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<Link
						to="/master/users"
						className="block rounded-lg border border-border bg-card p-6 transition-colors hover:bg-muted/40"
					>
						<h2 className="text-xl font-medium">Users</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							View and manage users data.
						</p>
					</Link>
					<Link
						to="/master/events"
						className="block rounded-lg border border-border bg-card p-6 transition-colors hover:bg-muted/40"
					>
						<h2 className="text-xl font-medium">Events</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							View and manage events data.
						</p>
					</Link>
					<Link
						to="/master/workshops"
						className="block rounded-lg border border-border bg-card p-6 transition-colors hover:bg-muted/40"
					>
						<h2 className="text-xl font-medium">Workshops</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							View and manage workshops data.
						</p>
					</Link>
				</div>
				<Outlet />
			</div>
		</div>
	);
}
