import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import React from "react";
import { authClient } from "@/lib/auth-client";

export default function Hero({
	user,
}: {
	user: {
		id: string;
		fullname: string;
		college: string;
		city: string;
		department: string;
		year: string;
		phone: string;
		gender: string;
	} | null;
}) {
	return (
		<div className="min-h-screen bg-[#090521] overflow-hidden relative font-sans text-white selection:bg-[#FF2E63]/30">
			{/* Video Background Layer */}
			<div className="absolute inset-0 z-0 overflow-hidden">
				<video
					autoPlay
					loop
					muted
					playsInline
					className="absolute inset-0 w-full h-full object-cover scale-[115%] opacity-80 mix-blend-screen"
				>
					<source src="/hero-bg.mp4" type="video/mp4" />
				</video>
				<div className="absolute inset-0 bg-[#090521]/40 mix-blend-multiply"></div>
			</div>

			{/* 5. Main Content UI */}
			<div className="relative z-30 flex flex-col items-center justify-center min-h-screen pb-20 px-4 text-center">
				<h1
					className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter leading-none text-transparent bg-clip-text animate-title-float font-['Syne']"
					style={{
						backgroundImage:
							"linear-gradient(to bottom, #f8fafc 0%, #ffffff 40%, #ffffff 44%, #1e293b 45%, #475569 50%, #94a3b8 100%)",
						filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.7))",
						WebkitTextStroke: "1px rgba(255, 255, 255, 0.8)",
						textShadow:
							"0 1px 0 #94a3b8, 0 2px 0 #64748b, 0 0 10px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.2)",
					}}
				>
					SYNERGY
				</h1>

				<div
					className="mt-2 sm:mt-3 text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-[0.6em] drop-shadow-[0_4px_15px_rgba(255,255,255,0.3)] uppercase transform -skew-x-12 font-['Outfit']"
					style={{
						backgroundImage: "linear-gradient(to bottom, #ffffff, #cbd5e1)",
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
					}}
				>
					2026
				</div>

				<div className="mt-4 text-sm sm:text-base md:text-lg font-bold tracking-[0.5em] text-[#00FFF9] uppercase font-['Outfit'] drop-shadow-[0_0_10px_rgba(0,255,249,0.5)] italic">
					Synthwave Continuum
				</div>

				{user && (
					<div className="mt-8 text-xl sm:text-2xl font-bold text-[#FF2E63] tracking-wider animate-in fade-in slide-in-from-bottom-4 duration-1000 uppercase drop-shadow-[0_0_10px_rgba(255,46,99,0.8)]">
						WELCOME, {user.fullname}
					</div>
				)}

				<div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-4 sm:gap-8 w-full sm:w-auto px-6 sm:px-0">
					{user ? (
						<>
							<Link
								to="/profile"
								className="group relative px-3 py-1 sm:px-10 sm:py-4 bg-[#FFDD00] hover:bg-[#FFDD00] text-black font-black text-sm sm:text-xl -skew-x-12 shadow-[5px_5px_0px_0px_rgba(255,46,99,1)] hover:shadow-[8px_8px_0px_0px_rgba(157,0,255,1)] transition-all hover:translate-y-1 active:translate-y-2 overflow-hidden w-full sm:w-auto text-center"
							>
								<span className="relative z-10 block skew-x-12 uppercase">
									Profile
								</span>
								<div className="absolute inset-0 bg-white/40 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
							</Link>
							<button
								type="button"
								onClick={async () => {
									await authClient.signOut();
									window.location.reload();
								}}
								className="group relative px-3 py-1 sm:px-10 sm:py-4 bg-[#FF2E63] hover:bg-[#FF2E63] text-white font-black text-sm sm:text-xl -skew-x-12 shadow-[5px_5px_0px_0px_rgba(157,0,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(255,221,0,1)] transition-all hover:translate-y-1 active:translate-y-2 overflow-hidden w-full sm:w-auto"
							>
								<span className="relative z-10 block skew-x-12 uppercase">
									Sign Out
								</span>
								<div className="absolute inset-0 bg-black/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
							</button>
						</>
					) : (
						<button
							type="button"
							onClick={async () => {
								await authClient.signIn.social({
									provider: "google",
								});
							}}
							className="group relative px-3 py-1 sm:px-10 sm:py-4 bg-[#FFDD00] hover:bg-[#FFDD00] text-black font-black text-sm sm:text-xl -skew-x-12 shadow-[5px_5px_0px_0px_rgba(255,46,99,1)] hover:shadow-[8px_8px_0px_0px_rgba(157,0,255,1)] transition-all hover:translate-y-1 active:translate-y-2 overflow-hidden w-full sm:w-auto"
						>
							<span className="relative z-10 block skew-x-12 uppercase">
								Sign In with Google
							</span>
							<div className="absolute inset-0 bg-white/40 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
						</button>
					)}
				</div>
			</div>

			{/* Scroll Down Arrow */}
			<div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30">
				<button
					type="button"
					onClick={() => {
						document.getElementById("events")?.scrollIntoView({
							behavior: "smooth",
						});
					}}
					className="flex flex-col items-center gap-2 group cursor-pointer transition-opacity duration-300 hover:opacity-100 opacity-70"
				>
					<span className="text-sm font-black uppercase tracking-[0.3em] text-white/50 group-hover:text-[#00FFF9] transition-colors">
						Explore
					</span>
					<div className="relative flex items-center justify-center">
						<div className="absolute inset-0 bg-[#00FFF9]/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
						<ChevronDown
							size={44}
							className="text-white group-hover:text-[#00FFF9] transition-colors animate-subtle-bounce"
						/>
					</div>
				</button>
			</div>

			{/* Marquee */}
			<div className="absolute bottom-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-md border-t border-white/10 overflow-hidden">
				<div className="flex w-max animate-marquee py-3 items-center">
					{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
						<React.Fragment key={i}>
							<span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase px-6 text-white/90 font-['Outfit']">
								Synergy - The Annual Symposium by the Mechanical Engineering
								Department of NIT Trichy
							</span>
							<span className="text-white/40 text-xl leading-none">✦</span>
						</React.Fragment>
					))}
				</div>
			</div>
		</div>
	);
}
