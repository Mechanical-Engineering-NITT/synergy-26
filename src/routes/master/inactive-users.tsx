import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { requireAdminUser } from "@/lib/utils";
import {
	getInactiveUsers,
	InactiveUsersHeader,
} from "@/server/admin/admin.master";

const masterInactiveUsersQueryOptions = queryOptions({
	queryKey: ["master", "inactive-users"],
	queryFn: () => getInactiveUsers(),
});

export const Route = createFileRoute("/master/inactive-users")({
	component: RouteComponent,
	loader: async () => {
		await requireAdminUser({ data: { roles: ["MASTER", "ADMIN"] } });
	},
});

function RouteComponent() {
	const [isDownloading, setIsDownloading] = useState(false);

	const {
		data: users,
		isLoading,
		isError,
	} = useQuery(masterInactiveUsersQueryOptions);

	const handleDownload = async () => {
		setIsDownloading(true);
		try {
			const res = await fetch("/api/master/download?type=inactive-users");
			if (!res.ok) throw new Error("Failed to download");
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "inactive_users.xlsx";
			a.click();
			URL.revokeObjectURL(url);
		} finally {
			setIsDownloading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				Loading inactive users...
			</div>
		);
	}

	if (isError) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				Failed to load inactive users.
			</div>
		);
	}

	if (!users) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				No data found.
			</div>
		);
	}

	return (
		<div className="mt-6 space-y-3">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{users.length} user{users.length !== 1 ? "s" : ""} onboarded but not
					registered for any event or workshop.
				</p>
				<button
					type="button"
					onClick={handleDownload}
					disabled={isDownloading || users.length === 0}
					className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isDownloading ? (
						<Loader2 size={14} className="animate-spin" />
					) : (
						<Download size={14} />
					)}
					{isDownloading ? "Exporting..." : "Export"}
				</button>
			</div>
			<div className="overflow-x-auto rounded-md border border-border bg-card">
				<table className="min-w-full text-sm">
					<thead className="bg-muted/40">
						<tr>
							{InactiveUsersHeader.map((header) => (
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
									{currentUser.synergyId ?? ""}
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
				{users.length === 0 && (
					<div className="p-6 text-center text-sm text-muted-foreground">
						No inactive users found.
					</div>
				)}
			</div>
		</div>
	);
}
