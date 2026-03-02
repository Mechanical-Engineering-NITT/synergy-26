import { User } from "lucide-react";
import { SimpleDetailsTable } from "@/components/pr/details-table";

function InfoCard({
	title,
	icon,
	rows,
}: {
	title: string;
	icon: typeof User;
	rows: Array<{ label: string; value: string }>;
}) {
	const Icon = icon;

	return (
		<div
			style={{
				backgroundColor: "#141414",
				borderRadius: "14px",
				padding: "16px",
				border: "1px solid #222222",
				transition: "all 0.2s ease",
			}}
		>
			<p
				className="inline-flex items-center"
				style={{
					color: "#fafafa",
					fontSize: "16px",
					fontWeight: 500,
					marginBottom: "12px",
				}}
			>
				<Icon
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					style={{ marginRight: "8px" }}
				/>
				{title}
			</p>
			<div className="space-y-2">
				{rows.map((row) => (
					<div
						key={`${title}-${row.label}`}
						className="flex items-center justify-between"
						style={{ borderTop: "1px solid #1f1f1f", paddingTop: "8px" }}
					>
						<span style={{ color: "#a1a1aa", fontSize: "14px" }}>
							{row.label}
						</span>
						<span
							style={{ color: "#fafafa", fontWeight: 500, fontSize: "14px" }}
						>
							{row.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

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
	const getValue = (value: unknown) =>
		value === null || value === undefined ? "-" : String(value);

	if (activeTab === "profile") {
		return (
			<div className="flex flex-col gap-4">
				<InfoCard
					title="User Info"
					icon={User}
					rows={[
						{ label: "User ID", value: getValue(profile.id) },
						{ label: "Full Name", value: getValue(profile.fullname) },
						{ label: "Email", value: getValue(profile.email) },
						{ label: "Phone", value: getValue(profile.phone) },
					]}
				/>
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
		<div
			className="rounded-md p-4 text-sm"
			style={{
				backgroundColor: "#141414",
				color: "#71717a",
				border: "1px solid #222222",
			}}
		>
			Invalid tab selected.
		</div>
	);
}
