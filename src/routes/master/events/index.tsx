import { createFileRoute } from "@tanstack/react-router";
import { enforceAdminAccess } from "@/lib/utils";

export const Route = createFileRoute("/master/events/")({
	loader: async () => {
		await enforceAdminAccess();
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/master/events/"!</div>;
}
