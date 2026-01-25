import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Building2,
	GraduationCap,
	Loader,
	Mail,
	MapPin,
	Phone,
	UserCircle,
} from "lucide-react";
import { PaymentHistory } from "@/components/payment/payment-history";
import { requireOnBoardedUser } from "@/lib/utils";
import { getUserDetails } from "@/server/user";

export const Route = createFileRoute("/profile/")({
	component: RouteComponent,
	loader: async () => {
		await requireOnBoardedUser();
	},
});

function RouteComponent() {
	const { data: user, isLoading } = useQuery({
		queryKey: ["userDetails"],
		queryFn: () => getUserDetails(),
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<Loader className="animate-spin h-12 w-12 text-blue-500" />
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<p className="text-red-500">Failed to load user profile.</p>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto px-4 py-12">
			<div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-2xl">
				{/* Profile Content */}
				<div className="pt-8 pb-12 px-8">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
							{user.fullname}
						</h1>
						<p className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
							<GraduationCap className="w-4 h-4" />
							{user.year} Year, {user.department}
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Bio/Details Section */}
						<div className="space-y-6">
							<h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
								Personal Information
							</h2>
							<div className="grid gap-4">
								<InfoItem
									icon={<UserCircle className="w-5 h-5" />}
									label="Gender"
									value={user.gender}
								/>
								<InfoItem
									icon={<Mail className="w-5 h-5" />}
									label="Email Address"
									value={user.email}
								/>
								<InfoItem
									icon={<Phone className="w-5 h-5" />}
									label="Phone Number"
									value={user.phone}
								/>
								<InfoItem
									icon={<MapPin className="w-5 h-5" />}
									label="City"
									value={user.city}
								/>
							</div>
						</div>

						{/* Academic Section */}
						<div className="space-y-6">
							<h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
								Academic Details
							</h2>
							<div className="grid gap-4">
								<InfoItem
									icon={<Building2 className="w-5 h-5" />}
									label="College"
									value={user.college}
								/>
								<InfoItem
									icon={<Building2 className="w-5 h-5" />}
									label="Department"
									value={user.department}
								/>
								<InfoItem
									icon={<GraduationCap className="w-5 h-5" />}
									label="Year of Study"
									value={`${user.year} Year`}
								/>
							</div>
						</div>
					</div>

					{/* Payment History Section */}
					<div className="mt-12 space-y-6">
						<h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
							Payment History
						</h2>
						<PaymentHistory />
					</div>
				</div>
			</div>
		</div>
	);
}

function InfoItem({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string | number;
}) {
	return (
		<div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all group">
			<div className="p-2 rounded-lg bg-white dark:bg-zinc-800 text-zinc-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 shadow-sm transition-colors">
				{icon}
			</div>
			<div>
				<p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">
					{label}
				</p>
				<p className="text-zinc-900 dark:text-zinc-100 font-medium">{value}</p>
			</div>
		</div>
	);
}
