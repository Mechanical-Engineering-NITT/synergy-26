import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Download, Loader2, Wrench } from "lucide-react";
import { useState } from "react";
import { requireAdminUser } from "@/lib/utils";
import { getUserData, UserDataHeader } from "@/server/admin/admin.master";

const masterUsersQueryOptions = queryOptions({
	queryKey: ["master", "users"],
	queryFn: () => getUserData(),
});

export const Route = createFileRoute("/master/users")({
	component: RouteComponent,
	loader: async () => {
		await requireAdminUser({ data: { roles: ["MASTER", "ADMIN"] } });
	},
});

type MasterUser = Awaited<ReturnType<typeof getUserData>>[number];

const renderRegistrationList = (titles: MasterUser["registeredEvents"]) => {
	if (titles.length === 0) {
		return <span className="text-muted-foreground">None</span>;
	}

	return (
		<div className="flex flex-col gap-1 text-sm">
			{titles.map((title) => (
				<span key={title}>{title}</span>
			))}
		</div>
	);
};

function RouteComponent() {
	const [isDownloading, setIsDownloading] = useState(false);
	const { data: users, isLoading, isError } = useQuery(masterUsersQueryOptions);

	const handleDownload = async () => {
		setIsDownloading(true);
		try {
			const res = await fetch("/api/master/download?type=users");
			if (!res.ok) throw new Error("Failed to download");
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "all_users.xlsx";
			a.click();
			URL.revokeObjectURL(url);
		} finally {
			setIsDownloading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				Loading users...
			</div>
		);
	}

	if (isError) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				Failed to load users.
			</div>
		);
	}

	if (!users) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				No users found.
			</div>
		);
	}

	return (
		<div className="mt-6 space-y-3">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{users.length} user{users.length !== 1 ? "s" : ""}
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
							{UserDataHeader.map((header) => (
								<th key={header} className="px-3 py-2 text-left font-medium">
									{header === "Registered Events" ? (
										<div className="flex items-center gap-2">
											<Calendar size={14} />
											<span>{header}</span>
										</div>
									) : header === "Registered Workshops" ? (
										<div className="flex items-center gap-2">
											<Wrench size={14} />
											<span>{header}</span>
										</div>
									) : (
										header
									)}
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
								<td className="px-3 py-2 align-top whitespace-normal">
									{renderRegistrationList(currentUser.registeredEvents)}
								</td>
								<td className="px-3 py-2 align-top whitespace-normal">
									{renderRegistrationList(currentUser.registeredWorkshops)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
