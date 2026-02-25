import { Calendar } from "lucide-react";
import { useState } from "react";

interface ScheduleItem {
	type: string;
	title: string;
	time: string;
	venue: string;
}

const SCHEDULE_DATA: Record<string, ScheduleItem[]> = {
	"06-03-2026": [
		{
			type: "GL",
			title: "INAUGURATION",
			time: "9AM - 11 AM",
			venue: "BARN HALL",
		},
		{
			type: "SCHOOL STUDENT WORKSHOP",
			title: "SR WORKSHOP",
			time: "11AM - 12.30 PM",
			venue: "GJCH CONFERENCE HALL -2",
		},
		{
			type: "WORKSHOP",
			title: "SIMULATION INNOVATION (ANSYS)",
			time: "8.30AM - 12.45 PM , 2.30PM - 4.30PM",
			venue: "VIOLET LAB",
		},
		{
			type: "WORKSHOP",
			title: "ICE TO EV",
			time: "8.30 AM - 12.45 PM , 2.30PM - 4.30PM",
			venue: "POPPY HALL",
		},
		{
			type: "EVENT",
			title: "SIMULATION CHALLENGE (ANSYS)",
			time: "4.30 PM - 6.30 PM",
			venue: "VIOLET LAB",
		},
		{
			type: "EVENT",
			title: "RESEARCH 2 REALITY ( SLOT BASIS )",
			time: "8.30AM - 12.45 PM , 2.30PM - 4.30PM",
			venue: "A12 HALL",
		},
		{
			type: "EVENT",
			title: "LATHE IT OFF ( SLOT BASIS )",
			time: "8.30AM - 12.45 PM , 2.30PM - 4.30PM",
			venue: "CENTRAL WORKSHOP",
		},
	],
	"07-03-2026": [
		{
			type: "GL",
			title: "ASHOK LEYLAND VP",
			time: "2PM - 4PM",
			venue: "GJCH CONFERENCE HALL- 2",
		},
		{
			type: "WORKSHOP",
			title: "PRODUCT DESIGN WITH CREO",
			time: "8.30AM - 12.45 PM , 2.30PM - 4.30PM",
			venue: "SHOEFLOWER",
		},
		{
			type: "WORKSHOP",
			title: "SMART DIGITAL MANUFACTURING",
			time: "8.30AM - 12.45 PM , 2.30PM - 4.30PM",
			venue: "MARIGOLD",
		},
		{
			type: "EVENT",
			title: "MECHANICAL ENGINEERING QUIZ",
			time: "6.30PM - 7.30PM",
			venue: "ORION G2",
		},
		{
			type: "EVENT",
			title: "AEROGLIDE",
			time: "4.30PM - 6.30 PM",
			venue: "ORION G1",
		},
	],
	"08-03-2026": [
		{ type: "GL", title: "VALEDICTION", time: "4PM - 7PM", venue: "BARN HALL" },
		{
			type: "WORKSHOP",
			title: "PRODUCT DESIGN WITH CREO",
			time: "8.30AM - 11.30 AM , 2.30PM - 4.30PM",
			venue: "SHOEFLOWER",
		},
		{
			type: "WORKSHOP",
			title: "INDUSTRIAL AUTOMATION",
			time: "8.30AM - 12.45 PM , 2.30PM - 4.30PM",
			venue: "MARIGOLD",
		},
		{
			type: "EVENT",
			title: "CAD-THON",
			time: "11.30AM - 12.45PM",
			venue: "SHOEFLOWER",
		},
	],
};

const DATES = Object.keys(SCHEDULE_DATA);

function ScheduleTable({ items }: { items: ScheduleItem[] }) {
	return (
		<div className="w-full overflow-x-auto pb-4">
			<table className="w-full border-collapse min-w-[600px] text-left">
				<thead>
					<tr className="bg-[#9D00FF]/20 border border-[#9D00FF]/50 text-[#FFDD00] font-black uppercase tracking-[0.2em] text-xs">
						<th className="p-4 whitespace-nowrap">
							<div className="flex items-center gap-2">
								<span className="w-1.5 h-1.5 bg-[#FFDD00] shadow-[0_0_5px_rgba(255,221,0,0.8)]"></span>
								Event/Workshop/GL
							</div>
						</th>
						<th className="p-4 whitespace-nowrap">
							<div className="flex items-center gap-2">
								<span className="w-1.5 h-1.5 bg-[#FFDD00] shadow-[0_0_5px_rgba(255,221,0,0.8)]"></span>
								Title
							</div>
						</th>
						<th className="p-4 whitespace-nowrap">
							<div className="flex items-center gap-2">
								<span className="w-1.5 h-1.5 bg-[#FFDD00] shadow-[0_0_5px_rgba(255,221,0,0.8)]"></span>
								Time
							</div>
						</th>
						<th className="p-4 whitespace-nowrap">
							<div className="flex items-center gap-2">
								<span className="w-1.5 h-1.5 bg-[#FFDD00] shadow-[0_0_5px_rgba(255,221,0,0.8)]"></span>
								Venue
							</div>
						</th>
					</tr>
				</thead>
				<tbody className="bg-[#090521]/40 backdrop-blur-md">
					{items.map((item) => (
						<tr
							key={item.title}
							className="border border-white/10 hover:bg-[#9D00FF]/20 hover:shadow-[0_0_15px_rgba(157,0,255,0.3)] transition-all duration-300 group"
						>
							<td className="p-4">
								<span className="inline-block px-2 py-1 bg-[#9D00FF]/20 border border-[#9D00FF]/50 text-[#FFDD00] text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
									{item.type}
								</span>
							</td>
							<td className="p-4">
								<span className="text-sm md:text-base font-black text-white uppercase italic tracking-wider group-hover:text-[#FFDD00] transition-colors drop-shadow-[0_0_5px_rgba(157,0,255,0.5)]">
									{item.title}
								</span>
							</td>
							<td className="p-4">
								<span className="text-sm font-bold uppercase tracking-widest text-gray-300 group-hover:text-white transition-colors">
									{item.time}
								</span>
							</td>
							<td className="p-4">
								<span className="text-sm font-bold uppercase tracking-widest text-[#9D00FF] group-hover:text-[#FFDD00] transition-colors drop-shadow-[0_0_5px_rgba(157,0,255,0.3)]">
									{item.venue}
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default function Schedule() {
	const [activeDate, setActiveDate] = useState(DATES[0]);

	const currentSchedule = SCHEDULE_DATA[activeDate] || [];

	return (
		// biome-ignore lint/correctness/useUniqueElementIds: required for anchor scrolling from another section
		<div
			id="schedule"
			className="overflow-hidden relative font-sans text-white selection:bg-[#9D00FF]/30 py-20 bg-transparent"
		>
			<div className="relative z-30 p-6 max-w-6xl mx-auto">
				<h1
					className="text-4xl sm:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-linear-to-b from-[#9D00FF] via-[#9D00FF] to-[#FFDD00] drop-shadow-[0_0_20px_rgba(255,221,0,0.3)] mb-2 uppercase text-center"
					style={{
						WebkitTextStroke: "1px rgba(255,255,255,0.1)",
						textShadow: "2px 2px 0px #FFDD00",
						filter: "drop-shadow(0 0 10px rgba(157,0,255,0.6))",
					}}
				>
					Schedule
				</h1>
				<p
					className="text-center text-[#FFDD00] font-bold tracking-widest uppercase mb-12 drop-shadow-[0_0_10px_rgba(255,221,0,0.8)]"
					style={{ fontFamily: "monospace" }}
				>
					Plan your destiny
				</p>

				{/* Date Tabs */}
				<div className="flex flex-wrap justify-center gap-4 mb-12">
					{DATES.map((date) => (
						<button
							key={date}
							onClick={() => setActiveDate(date)}
							type="button"
							className={`relative px-6 py-3 font-black text-sm sm:text-base uppercase tracking-widest transition-all duration-300 -skew-x-12 ${
								activeDate === date
									? "bg-[#9D00FF] text-white shadow-[0_0_15px_rgba(157,0,255,0.8)] border border-[#9D00FF]"
									: "bg-[#090521]/50 text-gray-400 border border-white/20 hover:border-[#9D00FF]/50 hover:text-white"
							}`}
						>
							<span className="skew-x-12 flex items-center gap-2">
								<Calendar className="w-4 h-4" />
								{date}
							</span>
						</button>
					))}
				</div>

				{/* Schedule Content */}
				<div className="mt-8 animate-in fade-in duration-500">
					<ScheduleTable items={currentSchedule} />
				</div>
			</div>
		</div>
	);
}
