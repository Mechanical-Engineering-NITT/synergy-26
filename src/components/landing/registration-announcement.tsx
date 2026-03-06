import { AlertCircle } from "lucide-react";

const announcementMessage = "Event registrations are currently disabled.";

export default function RegistrationAnnouncement() {
	return (
		<div className="w-full border-b border-white/10 bg-[#090521]/20 backdrop-blur-md">
			<div className="max-w-400 mx-auto overflow-hidden px-4 sm:px-6 lg:px-8">
				<div className="flex w-max min-w-full items-center py-2 animate-registration-marquee">
					{[0, 1].map((item) => (
						<div
							key={item}
							className="flex shrink-0 items-center gap-3 pr-8 text-xs font-black uppercase tracking-widest text-white/90 sm:text-sm"
						>
							<AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
							<span>{announcementMessage}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
