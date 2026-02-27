import { SimpleDetailsTable } from "@/components/pr/details-table";

export function PrUserDetailsTabs({
	activeTab,
	data,
}: {
	activeTab: string;
	data: Record<string, unknown>;
}) {
	const profile = (data.profile as Record<string, unknown> | undefined) ?? {};
	const eventRows =
		(data.events as Array<Record<string, unknown>> | undefined) ?? [];
	const workshopRows =
		(data.workshops as Array<Record<string, unknown>> | undefined) ?? [];
	const paymentRows =
		(data.payments as Array<Record<string, unknown>> | undefined) ?? [];

	if (activeTab === "profile") {
		return (
			<div className="overflow-x-auto rounded-md border border-border bg-card">
				<table className="min-w-full text-sm">
					<thead className="bg-muted/40">
						<tr>
							<th className="px-3 py-2 text-left font-medium">User ID</th>
							<th className="px-3 py-2 text-left font-medium">Full Name</th>
							<th className="px-3 py-2 text-left font-medium">Email</th>
							<th className="px-3 py-2 text-left font-medium">Phone</th>
						</tr>
					</thead>
					<tbody>
						<tr className="border-t border-border">
							<td className="px-3 py-2 whitespace-nowrap">
								{String(profile.id ?? "-")}
							</td>
							<td className="px-3 py-2 whitespace-nowrap">
								{String(profile.fullname ?? "-")}
							</td>
							<td className="px-3 py-2 whitespace-nowrap">
								{String(profile.email ?? "-")}
							</td>
							<td className="px-3 py-2 whitespace-nowrap">
								{String(profile.phone ?? "-")}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}

	if (activeTab === "events") {
		return (
			<SimpleDetailsTable
				key="events"
				headers={["Event ID", "Event Title", "Registered"]}
				rows={eventRows.map((eventRow) => [
					String(eventRow.id ?? "-"),
					String(eventRow.title ?? "-"),
					eventRow.isRegistered ? "Yes" : "No",
				])}
				emptyLabel="No event registrations found."
			/>
		);
	}

	if (activeTab === "workshops") {
		return (
			<SimpleDetailsTable
				key="workshops"
				headers={["Workshop ID", "Workshop Title", "Registered"]}
				rows={workshopRows.map((workshopRow) => [
					String(workshopRow.id ?? "-"),
					String(workshopRow.title ?? "-"),
					workshopRow.isRegistered ? "Yes" : "No",
				])}
				emptyLabel="No workshop registrations found."
			/>
		);
	}

	if (activeTab === "payments") {
		return (
			<SimpleDetailsTable
				key="payments"
				headers={["Payment ID", "Amount", "Status", "Created At"]}
				rows={paymentRows.map((paymentRow) => [
					String(paymentRow.id ?? "-"),
					`₹${(Number(paymentRow.amount ?? 0) / 100).toFixed(2)}`,
					String(paymentRow.status ?? "-"),
					paymentRow.createdAt
						? new Date(String(paymentRow.createdAt)).toLocaleString()
						: "-",
				])}
				emptyLabel="No payments found."
			/>
		);
	}

	return (
		<div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
			Invalid tab selected.
		</div>
	);
}
