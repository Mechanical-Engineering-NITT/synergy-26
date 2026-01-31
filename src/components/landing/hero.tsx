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
		<div className="min-h-screen bg-black overflow-hidden relative font-sans text-white selection:bg-fuchsia-500/30">
			{/* 1. Starry Background Layer */}
			<div className="absolute inset-0 bg-black z-0">
				<div className="absolute inset-0 opacity-70 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
			</div>

			{/* 2. Retro Sun Section */}
			<div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 rounded-full bg-linear-to-t from-yellow-400 via-pink-500 to-purple-600 blur-sm z-10 shadow-[0_0_50px_rgba(236,72,153,0.5)]"></div>

			{/* 3. Moving Perspective Grid */}
			<div
				className="absolute bottom-0 w-full h-[50vh] z-20"
				style={{
					background:
						"linear-gradient(to bottom, transparent 0%, rgba(236, 72, 153, 0.2) 100%)",
					transform: "perspective(500px) rotateX(60deg)",
					transformOrigin: "bottom center",
				}}
			>
				<div
					className="absolute inset-0 animate-grid-move"
					style={{
						backgroundImage: `
                            linear-gradient(0deg, transparent 24%, rgba(236, 72, 153, .5) 25%, rgba(236, 72, 153, .5) 26%, transparent 27%, transparent 74%, rgba(236, 72, 153, .5) 75%, rgba(236, 72, 153, .5) 76%, transparent 77%, transparent),
                            linear-gradient(90deg, transparent 24%, rgba(236, 72, 153, .5) 25%, rgba(236, 72, 153, .5) 26%, transparent 27%, transparent 74%, rgba(236, 72, 153, .5) 75%, rgba(236, 72, 153, .5) 76%, transparent 77%, transparent)
                        `,
						backgroundSize: "60px 60px",
					}}
				/>
			</div>

			{/* 4. Wireframe Car */}
			<div className="absolute bottom-[30vh] sm:bottom-[35vh] left-1/2 -translate-x-1/2 z-1 pointer-events-none">
				<div className="relative flex justify-center items-center">
					{/* Soft glow behind the car to hide any remaining background mismatch */}
					<div className="absolute w-[80%] h-[60%] bg-cyan-500/20 blur-[120px] rounded-full" />

					<img
						src="/wireframe-car-classy.png"
						alt="Wireframe Car"
						className="w-[280px] sm:w-[500px] md:w-[750px] max-w-none opacity-100
                                   mix-blend-screen 
                                   mask-[radial-gradient(ellipse_at_center,black_70%,transparent_100%)]
                                   drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]"
					/>
				</div>
			</div>

			{/* 5. Main Content UI */}
			<div className="relative z-30 flex flex-col items-center justify-center min-h-screen pb-20 px-4 text-center">
				<h2
					className="tracking-[0.2em] sm:tracking-[0.5em] font-bold text-xs sm:text-lg md:text-2xl animate-pulse mb-4 sm:mb-6 uppercase text-transparent bg-clip-text bg-linear-to-b from-red-950 via-red-900 to-red-800"
					style={{
						textShadow: "1px 1px 0px #fef3c7",
					}}
				>
					Mechanical Engineering NITT
				</h2>

				<h1
					className="text-5xl sm:text-7xl md:text-9xl font-black italic tracking-wider sm:tracking-widest text-transparent bg-clip-text bg-linear-to-b from-red-950 via-red-900 to-red-800 drop-shadow-[0_0_20px_rgba(254,243,199,0.3)]"
					style={{
						WebkitTextStroke: "1px rgba(255,255,255,0.05)",
						textShadow: "2px 2px 0px #fef3c7",
					}}
				>
					SYNERGY
				</h1>

				<div
					className="mt-2 sm:mt-4 text-2xl sm:text-3xl md:text-6xl font-bold text-yellow-300 tracking-widest drop-shadow-[0_0_15px_rgba(253,224,71,0.6)] uppercase transform -skew-x-12"
					style={{ fontFamily: "monospace" }}
				>
					2026
				</div>

				{user && (
					<div className="mt-8 text-xl sm:text-2xl font-bold text-cyan-400 tracking-wider animate-in fade-in slide-in-from-bottom-4 duration-1000 uppercase">
						WELCOME, {user.name}
					</div>
				)}

				<div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-4 sm:gap-8 w-full sm:w-auto px-6 sm:px-0">
					{user ? (
						<>
							<Link
								to="/profile"
								className="group relative px-6 py-3 sm:px-10 sm:py-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-lg sm:text-xl -skew-x-12 shadow-[5px_5px_0px_0px_rgba(34,211,238,1)] transition-transform hover:translate-y-1 active:translate-y-2 overflow-hidden w-full sm:w-auto text-center"
							>
								<span className="relative z-10 block skew-x-12 uppercase">
									Profile
								</span>
								<div className="absolute inset-0 bg-black/10 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
							</Link>
							<button
								type="button"
								onClick={async () => {
									await authClient.signOut();
									window.location.reload();
								}}
								className="group relative px-6 py-3 sm:px-10 sm:py-4 bg-red-600 hover:bg-red-500 text-white font-black text-lg sm:text-xl -skew-x-12 shadow-[5px_5px_0px_0px_rgba(254,243,199,1)] transition-transform hover:translate-y-1 active:translate-y-2 overflow-hidden w-full sm:w-auto"
							>
								<span className="relative z-10 block skew-x-12 uppercase">
									Sign Out
								</span>
								<div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
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
							className="group relative px-6 py-3 sm:px-10 sm:py-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-lg sm:text-xl -skew-x-12 shadow-[5px_5px_0px_0px_rgba(34,211,238,1)] transition-transform hover:translate-y-1 active:translate-y-2 overflow-hidden w-full sm:w-auto"
						>
							<span className="relative z-10 block skew-x-12 uppercase">
								Sign In with Google
							</span>
							<div className="absolute inset-0 bg-black/10 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
