import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { requireAdminUser } from "@/lib/utils";
import {
	getUserDataByWorkshopId,
	getWorkshopData,
	UserDataByWorkshopIdHeader,
	WorkshopDataHeader,
} from "@/server/admin/admin.master";

const masterWorkshopsQueryOptions = queryOptions({
	queryKey: ["master", "workshops"],
	queryFn: () => getWorkshopData(),
});

const masterUsersByWorkshopQueryOptions = (workshopId: number) =>
	queryOptions({
		queryKey: ["master", "workshop-users", workshopId],
		queryFn: () => getUserDataByWorkshopId({ data: { workshopId } }),
	});

export const Route = createFileRoute("/master/workshops/$id")({
	loader: async ({ params }) => {
		await requireAdminUser({ data: { roles: ["MASTER", "ADMIN"] } });
		const workshopId = Number(params.id);
		if (Number.isNaN(workshopId)) {
			throw new Error("Invalid workshop id");
		}
		return { workshopId };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { workshopId } = Route.useLoaderData();
	const [isDownloading, setIsDownloading] = useState(false);

	const {
		data: workshops,
		isLoading: isWorkshopsLoading,
		isError: isWorkshopsError,
	} = useQuery(masterWorkshopsQueryOptions);
	const {
		data: registeredUsers,
		isLoading: isUsersLoading,
		isError: isUsersError,
	} = useQuery(masterUsersByWorkshopQueryOptions(workshopId));

	const handleDownload = async () => {
		setIsDownloading(true);
		try {
			const res = await fetch(
				`/api/master/download?type=workshop&id=${workshopId}`,
			);
			if (!res.ok) throw new Error("Failed to download");
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			const cd = res.headers.get("Content-Disposition");
			a.download =
				cd?.match(/filename="(.+)"/)?.[1] ??
				`workshop_${workshopId}_users.xlsx`;
			a.click();
			URL.revokeObjectURL(url);
		} finally {
			setIsDownloading(false);
		}
	};

	if (isWorkshopsLoading || isUsersLoading) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				Loading workshop data...
			</div>
		);
	}

	if (isWorkshopsError || isUsersError) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				Failed to load workshop data.
			</div>
		);
	}

	if (!workshops || !registeredUsers) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				No workshop data found.
			</div>
		);
	}

	const workshop = workshops.find((w) => w.id === workshopId);

	if (!workshop) {
		return (
			<div className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				No workshop found.
			</div>
		);
	}

	return (
		<div className="mt-6 space-y-6">
			<h2 className="text-2xl font-semibold">{workshop.title}</h2>

			<section>
				<h3 className="mb-3 text-lg font-medium">Workshop Details</h3>
				<div className="overflow-x-auto rounded-md border border-border bg-card">
					<table className="min-w-full text-sm">
						<thead className="bg-muted/40">
							<tr>
								{WorkshopDataHeader.map((header) => (
									<th key={header} className="px-3 py-2 text-left font-medium">
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							<tr className="border-t border-border">
								<td className="px-3 py-2 whitespace-nowrap">{workshop.id}</td>
								<td className="px-3 py-2 whitespace-nowrap">
									{workshop.title}
								</td>
								<td className="px-3 py-2 whitespace-nowrap">
									{workshop.price}
								</td>
								<td className="px-3 py-2 whitespace-nowrap">
									{workshop.registered_users}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			<section>
				<div className="mb-3 flex items-center justify-between">
					<h3 className="text-lg font-medium">
						Registered Users ({registeredUsers.length})
					</h3>
					<button
						type="button"
						onClick={handleDownload}
						disabled={isDownloading || registeredUsers.length === 0}
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
								{UserDataByWorkshopIdHeader.map((header) => (
									<th key={header} className="px-3 py-2 text-left font-medium">
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{registeredUsers.map((currentUser) => (
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
				</div>
			</section>
		</div>
	);
}
