import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Building2,
	GraduationCap,
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
			<div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
				<div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
				<div className="flex flex-col items-center gap-6 relative z-10">
					<div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_20px_rgba(34,211,238,0.3)]"></div>
					<p className="text-cyan-400 font-black uppercase tracking-[0.4em] animate-pulse">
						Synchronizing Profile...
					</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
				<div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
				<div className="bg-zinc-900/50 backdrop-blur-md border border-red-500/50 p-12 -skew-x-2 text-center relative z-10 shadow-[20px_20px_0px_0px_rgba(239,68,68,0.2)]">
					<h2 className="text-3xl font-black text-red-500 uppercase tracking-tighter italic mb-4">
						Access Denied
					</h2>
					<p className="text-gray-400 font-bold uppercase tracking-widest max-w-sm">
						Critical error: Failed to retrieve profile signal. Please refresh or
						contact system admin.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black font-sans text-white selection:bg-fuchsia-500/30 relative overflow-hidden">
			{/* Starry Background Layer */}
			<div className="absolute inset-0 bg-black z-0">
				<div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
			</div>

			<div className="relative z-10 max-w-5xl mx-auto px-4 py-20">
				<div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 overflow-hidden -skew-x-1 shadow-[15px_15px_0px_0px_rgba(34,211,238,0.2)]">
					{/* Profile Header */}
					<div className="pt-12 pb-10 px-8 md:px-12 border-b border-white/5 relative">
						<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-cyan-500/10 to-transparent"></div>
						<h1
							className="text-4xl md:text-6xl font-black italic tracking-wider text-transparent bg-clip-text bg-linear-to-b from-red-950 via-red-900 to-red-800 drop-shadow-[0_0_20px_rgba(254,243,199,0.3)] mb-4 uppercase"
							style={{
								WebkitTextStroke: "1px rgba(255,255,255,0.05)",
								textShadow: "2px 2px 0px #fef3c7",
							}}
						>
							{user.fullname}
						</h1>
						<div className="flex flex-wrap items-center gap-4 text-cyan-400 font-bold uppercase tracking-widest text-xs">
							<span className="flex items-center gap-2 bg-cyan-500/10 px-3 py-1 border border-cyan-500/30">
								<GraduationCap className="w-3 h-3" />
								{user.year} YEAR
							</span>
							<span className="flex items-center gap-2 bg-cyan-500/10 px-3 py-1 border border-cyan-500/30">
								<Building2 className="w-3 h-3" />
								{user.department}
							</span>
						</div>
					</div>

					<div className="px-8 md:px-12 py-12">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
							{/* Personal Section */}
							<div className="space-y-8">
								<h2 className="text-xl font-black text-amber-400 uppercase tracking-widest italic flex items-center gap-3">
									<span className="w-2 h-2 bg-cyan-500"></span>
									Personal Intel
								</h2>
								<div className="grid gap-6">
									<InfoItem
										icon={<UserCircle className="w-5 h-5" />}
										label="Gender"
										value={user.gender}
									/>
									<InfoItem
										icon={<Mail className="w-5 h-5" />}
										label="Email"
										value={user.email}
									/>
									<InfoItem
										icon={<Phone className="w-5 h-5" />}
										label="Terminal"
										value={user.phone}
									/>
									<InfoItem
										icon={<MapPin className="w-5 h-5" />}
										label="Sector"
										value={user.city}
									/>
								</div>
							</div>

							{/* Academic Section */}
							<div className="space-y-8">
								<h2 className="text-xl font-black text-amber-400 uppercase tracking-widest italic flex items-center gap-3">
									<span className="w-2 h-2 bg-cyan-500"></span>
									Academic Records
								</h2>
								<div className="grid gap-6">
									<InfoItem
										icon={<Building2 className="w-5 h-5" />}
										label="Institute"
										value={user.college}
									/>
									<InfoItem
										icon={<Building2 className="w-5 h-5" />}
										label="Division"
										value={user.department}
									/>
									<InfoItem
										icon={<GraduationCap className="w-5 h-5" />}
										label="Cycle"
										value={`${user.year} Year`}
									/>
								</div>
							</div>
						</div>

						{/* Payment History Section */}
						<div className="mt-20 space-y-8">
							<h2 className="text-xl font-black text-cyan-400 uppercase tracking-widest italic flex items-center gap-3">
								<span className="w-2 h-2 bg-amber-400"></span>
								Transaction Logs
							</h2>
							<div className="bg-white/5 border border-white/10 p-4 md:p-8 -skew-x-1">
								<PaymentHistory />
							</div>
						</div>
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
		<div className="flex items-start gap-4 p-5 bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
			<div className="absolute top-0 right-0 w-8 h-8 bg-linear-to-bl from-cyan-500/5 to-transparent"></div>
			<div className="p-2.5 bg-black border border-white/10 text-cyan-400 group-hover:text-amber-400 group-hover:border-amber-400/50 transition-all">
				{icon}
			</div>
			<div>
				<p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
					{label}
				</p>
				<p className="text-white font-bold tracking-tight uppercase">{value}</p>
			</div>
		</div>
	);
}
