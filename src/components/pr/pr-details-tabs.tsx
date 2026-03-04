import { Calendar, CreditCard, User, Wallet, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { SimpleDetailsTable } from "@/components/pr/details-table";

type PaymentRecord = {
	id: string;
	amount: number;
	isEventPass: boolean | null;
	workshopId: number | null;
	workshopTitle: string | null;
	createdAt: Date | string | null;
	updatedAt: Date | string | null;
	status?: string;
};

function InfoCard({
	title,
	icon,
	rows,
}: {
	title: string;
	icon: typeof User;
	rows: Array<{ label: ReactNode; value: string }>;
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
						key={`${title}-${row.value}-${rows.indexOf(row)}`}
						className="flex items-center justify-between"
						style={{ borderTop: "1px solid #1f1f1f", paddingTop: "8px" }}
					>
						<span
							className="inline-flex items-center"
							style={{ color: "#71717a", fontSize: "14px", gap: "6px" }}
						>
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
	const onlinePaymentRows =
		(data.onlinePayments as PaymentRecord[] | undefined) ?? [];
	const onspotPaymentRows =
		(data.onspotPayments as PaymentRecord[] | undefined) ?? [];
	const getNotProvidedValue = (value: unknown) =>
		value === null || value === undefined || value === ""
			? "Not Provided"
			: String(value);
	const getValue = (value: unknown) =>
		value === null || value === undefined ? "-" : String(value);
	const getPaymentResourceLabel = (payment: PaymentRecord) => {
		if (payment.isEventPass) {
			return "Event Pass";
		}

		if (payment.workshopTitle) {
			return payment.workshopTitle;
		}

		if (payment.workshopId) {
			return `Workshop ${payment.workshopId}`;
		}

		return "-";
	};

	if (activeTab === "profile") {
		return (
			<div className="flex flex-col gap-4">
				<InfoCard
					title="User Info"
					icon={User}
					rows={[
						{ label: "Synergy ID", value: getValue(profile.synergyId) },
						{ label: "Full Name", value: getValue(profile.fullname) },
						{ label: "Email", value: getValue(profile.email) },
						{ label: "Phone", value: getValue(profile.phone) },
						{
							label: "College",
							value: getNotProvidedValue(profile.collegeName),
						},
						{ label: "Year", value: getNotProvidedValue(profile.year) },
						{
							label: "Department",
							value: getNotProvidedValue(profile.department),
						},
					]}
				/>
			</div>
		);
	}

	if (activeTab === "events") {
		return (
			<div>
				<div className="mb-4 flex items-center gap-2 text-[#fafafa] font-semibold">
					<Calendar size={16} color="#a1a1aa" />
					Registered Events
				</div>
				<SimpleDetailsTable
					key="events"
					headers={["Event ID", "Event Title"]}
					rows={eventRows.map((eventRow) => [
						String(eventRow.id ?? "-"),
						String(eventRow.title ?? "-"),
					])}
					emptyLabel="No event registrations found."
				/>
			</div>
		);
	}

	if (activeTab === "workshops") {
		return (
			<div>
				<div className="mb-4 flex items-center gap-2 text-[#fafafa] font-semibold">
					<Wrench size={16} color="#a1a1aa" />
					Registered Workshops
				</div>
				<SimpleDetailsTable
					key="workshops"
					headers={["Workshop ID", "Workshop Title"]}
					rows={workshopRows.map((workshopRow) => [
						String(workshopRow.id ?? "-"),
						String(workshopRow.title ?? "-"),
					])}
					emptyLabel="No workshop registrations found."
				/>
			</div>
		);
	}

	if (activeTab === "payments") {
		return (
			<div>
				<div className="mb-4 flex items-center gap-2 text-[#fafafa] font-semibold">
					<CreditCard size={16} color="#a1a1aa" />
					Online Payments
				</div>

				{onlinePaymentRows.length > 0 ? (
					<SimpleDetailsTable
						key="online-payments"
						headers={["Payment ID", "Amount", "Workshop/Event", "Created At"]}
						rows={onlinePaymentRows.map((paymentRow) => [
							String(paymentRow.id ?? "-"),
							`₹${(Number((paymentRow.amount ?? 0) / 100)).toFixed(2)}`,
							getPaymentResourceLabel(paymentRow),
							paymentRow.createdAt
								? new Date(String(paymentRow.createdAt)).toLocaleString()
								: "-",
						])}
						emptyLabel="No online payments found."
					/>
				) : (
					<div className="text-sm text-[#71717a]">
						No online payments found.
					</div>
				)}

				<div className="mt-6 mb-4 flex items-center gap-2 text-[#fafafa] font-semibold">
					<Wallet size={16} color="#a1a1aa" />
					Onspot Payments
				</div>

				{onspotPaymentRows.length > 0 ? (
					<SimpleDetailsTable
						key="onspot-payments"
						headers={["Payment ID", "Amount", "Workshop/Event", "Created At"]}
						rows={onspotPaymentRows.map((paymentRow) => [
							String(paymentRow.id ?? "-"),
							`₹${Number(paymentRow.amount ?? 0).toFixed(2)}`,
							getPaymentResourceLabel(paymentRow),
							paymentRow.createdAt
								? new Date(String(paymentRow.createdAt)).toLocaleString()
								: "-",
						])}
						emptyLabel="No onspot payments found."
					/>
				) : (
					<div className="text-sm text-[#71717a]">
						No onspot payments found.
					</div>
				)}
			</div>
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
