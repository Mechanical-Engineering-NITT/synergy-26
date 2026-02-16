import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Ticket as TicketIcon } from "lucide-react";
import Navbar from "@/components/common/navbar";
import { requireOnBoardedUser } from "@/lib/utils";
import { getRegistrations } from "@/server/registration";
import { getUserDetails } from "@/server/user";

export const Route = createFileRoute("/tickets/")({
	component: RouteComponent,
	loader: async () => {
		await requireOnBoardedUser();
	},
});

function RouteComponent() {
	const { data: user } = useQuery({
		queryKey: ["userDetails"],
		queryFn: () => getUserDetails(),
	});

	const { data: registrations, isLoading } = useQuery({
		queryKey: ["userRegistrations"],
		queryFn: () => getRegistrations(),
	});

	if (isLoading) {
		return (
			<div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
				<Navbar user={null} />
				<div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
				<div className="flex flex-col items-center gap-6 relative z-10">
					<div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_20px_rgba(34,211,238,0.3)]"></div>
					<p className="text-cyan-400 font-black uppercase tracking-[0.4em] animate-pulse">
						Retrieving Tickets...
					</p>
				</div>
			</div>
		);
	}

	// Map registrations to tickets
	const tickets =
		registrations?.map((reg) => ({
			id: reg.id,
			type: reg.workshopId ? "Workshop" : "Event",
			title: reg.workshopTitle || reg.eventTitle || "Untitled",
		})) || [];

	return (
		<div className="min-h-screen bg-black font-sans text-white selection:bg-fuchsia-500/30 relative overflow-hidden">
			<Navbar
				user={
					user
						? {
								id: user.userId,
								email: user.email,
								name: user.fullname,
							}
						: null
				}
			/>

			<div className="absolute inset-0 bg-black z-0">
				<div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
			</div>

			<div className="relative z-10 max-w-6xl mx-auto px-4 py-24">
				<header className="mb-12 text-center">
					<h1
						className="text-4xl md:text-7xl font-black italic tracking-wider text-transparent bg-clip-text bg-linear-to-b from-red-950 via-red-900 to-red-800 drop-shadow-[0_0_20px_rgba(254,243,199,0.3)] mb-4 uppercase"
						style={{
							WebkitTextStroke: "1px rgba(255,255,255,0.05)",
							textShadow: "2px 2px 0px #fef3c7",
						}}
					>
						Your Tickets
					</h1>
					<p className="text-cyan-400 font-bold uppercase tracking-[0.3em] text-sm">
						Verified Purchase Signals Detected
					</p>
				</header>

				{tickets.length === 0 ? (
					<div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-16 text-center -skew-x-2 shadow-[20px_20px_0px_0px_rgba(34,211,238,0.1)]">
						<TicketIcon className="w-16 h-16 text-zinc-700 mx-auto mb-6" />
						<h2 className="text-2xl font-black text-white uppercase italic mb-2">
							No Registrations Found
						</h2>
						<p className="text-gray-500 font-bold uppercase tracking-widest max-w-md mx-auto">
							You haven't registered for any events or workshops yet. Head over
							to the events section to sign up!
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{tickets.map((ticket) => (
							<TicketCard key={ticket.id} ticket={ticket} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function TicketCard({
	ticket,
}: {
	ticket: {
		id: number;
		type: string;
		title: string;
	};
}) {
	const isWorkshop = ticket.type === "Workshop";

	return (
		<div className="group relative bg-zinc-900/60 backdrop-blur-md border border-white/10 p-1 flex flex-col transition-all duration-500 hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] hover:-translate-y-2 overflow-hidden -skew-x-2">
			{/* Animated Accents */}
			<div
				className={`absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent ${
					isWorkshop ? "via-amber-500" : "via-cyan-500"
				} to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700`}
			></div>

			<div className="border border-white/5 p-6 h-full flex flex-col relative">
				{/* Corner Cut effect */}
				<div className="absolute -top-4 -right-4 w-8 h-8 bg-black rotate-45 border-b border-white/10"></div>

				<div className="flex justify-between items-start mb-6">
					<div
						className={`px-3 py-1 border text-[10px] font-black uppercase tracking-widest ${
							isWorkshop
								? "bg-amber-500/10 border-amber-500/30 text-amber-400"
								: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
						}`}
					>
						{ticket.type}
					</div>
					<div
						className={`w-2 h-2 rounded-full ${isWorkshop ? "bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,1)]" : "bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,1)]"} animate-pulse`}
					></div>
				</div>

				<h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2 group-hover:text-white transition-colors">
					{ticket.title}
				</h3>

				{/* Holographic effect */}
				<div
					className={`absolute inset-0 bg-linear-to-tr ${
						isWorkshop ? "from-amber-500/5" : "from-cyan-500/5"
					} via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
				></div>
			</div>
		</div>
	);
}
