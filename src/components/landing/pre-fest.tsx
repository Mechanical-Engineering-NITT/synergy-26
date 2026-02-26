import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getPreFestRegistrationStatus,
	registerForPreFestWorkshop,
} from "@/server/event";

export default function PreFestSection({
	isLoggedIn,
}: {
	isLoggedIn: boolean;
}) {
	return (
		// biome-ignore lint: Static ID is required for anchor scrolling
		<div
			id="pre-fest"
			className="min-h-screen overflow-hidden relative font-sans text-white selection:bg-[#9D00FF]/30 border-t border-white/5 flex flex-col justify-center"
		>
			<div className="relative z-30 p-6 max-w-7xl mx-auto py-20 w-full">
				<h1
					className="text-4xl sm:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-linear-to-b from-[#9D00FF] via-[#9D00FF] to-[#FFDD00] drop-shadow-[0_0_20px_rgba(255,221,0,0.3)] mb-2 uppercase text-center"
					style={{
						WebkitTextStroke: "1px rgba(255,255,255,0.1)",
						textShadow: "2px 2px 0px #FFDD00",
						filter: "drop-shadow(0 0 10px rgba(157,0,255,0.6))",
					}}
				>
					Pre-Fest Events
				</h1>
				<p
					className="text-center text-[#FFDD00] font-bold tracking-widest uppercase mb-12 drop-shadow-[0_0_10px_rgba(255,221,0,0.8)]"
					style={{ fontFamily: "monospace" }}
				>
					Gear up for Synergy '26
				</p>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
					{/* CREO Workshop */}
					<div className="group relative bg-[#090521]/60 backdrop-blur-md border border-white/10 p-8 md:p-12 transition-all duration-300 hover:border-[#9D00FF]/50 hover:shadow-[0_0_30px_rgba(157,0,255,0.2)] overflow-hidden -skew-x-2 flex flex-col min-h-[450px]">
						<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-[#9D00FF]/20 to-transparent -translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>

						<div className="relative z-10 w-full flex flex-col h-full">
							<h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-wider mb-2 group-hover:text-[#FFDD00] transition-colors drop-shadow-[0_0_5px_rgba(157,0,255,0.5)]">
								Intro to Product Design
							</h3>
							<div className="h-0.5 w-16 bg-[#9D00FF] mb-6 transition-all group-hover:w-full duration-500 shadow-[0_0_5px_rgba(157,0,255,0.8)]"></div>

							<div className="mb-6">
								<p className="text-[#FFDD00] font-bold text-base md:text-lg mb-1">
									27th Feb | 6 PM - 8 PM
								</p>
								<p className="text-xs md:text-sm text-gray-400 font-medium uppercase tracking-widest">
									Online Workshop - CAD with CREO (By MACH Engineers)
								</p>
							</div>

							<p className="text-gray-300 text-sm md:text-base font-bold leading-relaxed tracking-tight mb-10 grow">
								Kickstart your design journey with an introduction to product
								design using PTC Creo. Conducted by MACH Engineers, this Prefest
								workshop covers the fundamentals of 3D modelling, design
								thinking, and practical CAD applications. Participants will gain
								hands-on experience in creating and visualizing product
								concepts. Open to beginners and enthusiasts eager to explore
								real-world design tools. Join us to turn your ideas into
								engineered realities!
							</p>

							<div className="flex flex-wrap gap-6 items-center mt-auto">
								<RegistrationButton isLoggedIn={isLoggedIn} />
							</div>
						</div>
					</div>

					{/* Mech Reel Challenge */}
					<div className="group relative bg-[#090521]/60 backdrop-blur-md border border-white/10 p-8 md:p-12 transition-all duration-300 hover:border-[#9D00FF]/50 hover:shadow-[0_0_30px_rgba(157,0,255,0.2)] overflow-hidden -skew-x-2 flex flex-col min-h-[450px]">
						<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-[#9D00FF]/20 to-transparent -translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>

						<div className="relative z-10 w-full flex flex-col h-full">
							<h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-wider mb-2 group-hover:text-[#FFDD00] transition-colors drop-shadow-[0_0_5px_rgba(157,0,255,0.5)]">
								Mech Reel Challenge
							</h3>
							<div className="h-0.5 w-16 bg-[#9D00FF] mb-6 transition-all group-hover:w-full duration-500 shadow-[0_0_5px_rgba(157,0,255,0.8)]"></div>

							<div className="mb-6">
								<p className="text-[#FFDD00] font-bold text-base md:text-lg mb-1">
									Lights, Camera, Action!
								</p>
								<p className="text-xs md:text-sm text-gray-400 font-medium uppercase tracking-widest">
									Online Event
								</p>
							</div>

							<p className="text-gray-300 text-sm md:text-base font-bold leading-relaxed tracking-tighter mb-10 grow">
								Showcase your engineering creativity through video! Create a
								compelling reel that captures the essence of mechanical marvels
								and engineering excellence.
							</p>

							<div className="flex flex-wrap gap-6 items-center mt-auto">
								<div className="group/btn relative px-8 py-4 bg-[#9D00FF] hover:bg-[#B333FF] text-white font-black uppercase tracking-widest transition-all duration-300 transform -skew-x-6 hover:-translate-y-1 shadow-[0_0_20px_rgba(157,0,255,0.4)] hover:shadow-[0_0_30px_rgba(157,0,255,0.6)] cursor-not-allowed">
									Coming Soon...
								</div>
								<div className="flex flex-col">
									<span className="text-xs font-bold text-[#9D00FF] uppercase tracking-[0.2em] mb-1">
										Contact
									</span>
									<a
										href="tel:+916281658713"
										className="text-white font-black hover:text-[#FFDD00] transition-colors"
									>
										+91 6281658713
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function RegistrationButton({ isLoggedIn }: { isLoggedIn: boolean }) {
	const queryClient = useQueryClient();

	const { data: status, isLoading: isStatusLoading } = useQuery({
		queryKey: ["pre-fest-status"],
		queryFn: getPreFestRegistrationStatus,
	});

	const { mutate: register, isPending: isRegistering } = useMutation({
		mutationFn: registerForPreFestWorkshop,
		onSuccess: () => {
			toast.success("Registered for CREO Workshop successfully!");
			queryClient.invalidateQueries({ queryKey: ["pre-fest-status"] });
		},
		onError: (error) => {
			toast.error(`Registration failed: ${error.message}`);
		},
	});

	const isRegistered = status?.isRegistered || false;

	return (
		<button
			type="button"
			onClick={() => {
				if (!isLoggedIn) {
					toast.error("Please sign in to register");
					return;
				}
				register({ data: undefined });
			}}
			disabled={isRegistering || isStatusLoading || isRegistered}
			className={`group/btn inline-flex relative px-8 py-4 font-black uppercase tracking-widest transition-all duration-300 transform -skew-x-6 shadow-[0_0_20px_rgba(157,0,255,0.4)]
                ${
									isRegistered
										? "bg-[#9D00FF]/20 text-[#FFDD00] border border-[#9D00FF]/50 cursor-default"
										: "bg-[#9D00FF] hover:bg-[#B333FF] text-white hover:-translate-y-1"
								}
                disabled:opacity-80`}
		>
			<span className="relative z-10 flex items-center gap-2">
				{isRegistering ? (
					"Processing..."
				) : isRegistered ? (
					<>
						<span className="text-[10px]">●</span> REGISTERED
					</>
				) : (
					"REGISTER"
				)}
			</span>
		</button>
	);
}
