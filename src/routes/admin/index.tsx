import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EventsManagement } from "@/components/admin/events-management";
import { WorkshopsManagement } from "@/components/admin/workshops-management";
import { requireAdminUser } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
	component: Admin,
	loader: async () => {
		await requireAdminUser("ADMIN-MASTER");
	},
});

function Admin() {
	const [activeTab, setActiveTab] = useState<"events" | "workshops">("events");

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="max-w-7xl mx-auto px-4 py-8">
				<h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

				<div className="mb-6 border-b border-border">
					<div className="flex gap-0">
						<button
							type="button"
							onClick={() => setActiveTab("events")}
							className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
								activeTab === "events"
									? "border-primary text-primary bg-primary/5"
									: "border-transparent text-muted-foreground hover:text-foreground"
							}`}
						>
							Events Management
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("workshops")}
							className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
								activeTab === "workshops"
									? "border-primary text-primary bg-primary/5"
									: "border-transparent text-muted-foreground hover:text-foreground"
							}`}
						>
							Workshops Management
						</button>
					</div>
				</div>

				<div className="bg-card rounded-lg border border-border p-6">
					{activeTab === "events" && <EventsManagement />}
					{activeTab === "workshops" && <WorkshopsManagement />}
				</div>
			</div>
		</div>
	);
}
