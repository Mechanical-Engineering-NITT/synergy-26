import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export default function Hero({
	user,
}: {
	user: {
		id: string;
		email: string;
		name: string;
		onBoardingComplete: boolean;
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
					className="text-5xl sm:text-7xl md:text-9xl font-black italic tracking-wider sm:tracking-widest text-transparent bg-clip-text bg-linear-to-b from-[#9D00FF] via-[#FF2E63] to-[#FFDD00] drop-shadow-[0_0_30px_rgba(255,221,0,0.4)]"
					style={{
						WebkitTextStroke: "2px rgba(255,255,255,0.1)",
						textShadow: "4px 4px 0px #FFDD00",
					}}
				>
					SYNERGY
				</h1>

				<div
					className="mt-2 sm:mt-4 text-2xl sm:text-3xl md:text-6xl font-bold text-[#FFDD00] tracking-widest drop-shadow-[0_0_20px_rgba(255,221,0,0.8)] uppercase transform -skew-x-12"
					style={{ fontFamily: "monospace" }}
				>
					2026
				</div>

				{user && (
					<div className="mt-8 text-xl sm:text-2xl font-bold text-[#FF2E63] tracking-wider animate-in fade-in slide-in-from-bottom-4 duration-1000 uppercase drop-shadow-[0_0_10px_rgba(255,46,99,0.8)]">
						WELCOME, {user.name}
					</div>
				)}

				<div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-4 sm:gap-8 w-full sm:w-auto px-6 sm:px-0">
					{user ? (
						<>
							<Link
								to="/profile"
								className="group relative px-6 py-3 sm:px-10 sm:py-4 bg-[#FFDD00] hover:bg-[#FFDD00] text-black font-black text-lg sm:text-xl -skew-x-12 shadow-[5px_5px_0px_0px_rgba(255,46,99,1)] hover:shadow-[8px_8px_0px_0px_rgba(157,0,255,1)] transition-all hover:translate-y-1 active:translate-y-2 overflow-hidden w-full sm:w-auto text-center"
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
								className="group relative px-6 py-3 sm:px-10 sm:py-4 bg-[#FF2E63] hover:bg-[#FF2E63] text-white font-black text-lg sm:text-xl -skew-x-12 shadow-[5px_5px_0px_0px_rgba(157,0,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(255,221,0,1)] transition-all hover:translate-y-1 active:translate-y-2 overflow-hidden w-full sm:w-auto"
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
							className="group relative px-6 py-3 sm:px-10 sm:py-4 bg-[#FFDD00] hover:bg-[#FFDD00] text-black font-black text-lg sm:text-xl -skew-x-12 shadow-[5px_5px_0px_0px_rgba(255,46,99,1)] hover:shadow-[8px_8px_0px_0px_rgba(157,0,255,1)] transition-all hover:translate-y-1 active:translate-y-2 overflow-hidden w-full sm:w-auto"
						>
							<span className="relative z-10 block skew-x-12 uppercase">
								Sign In with Google
							</span>
							<div className="absolute inset-0 bg-white/40 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
