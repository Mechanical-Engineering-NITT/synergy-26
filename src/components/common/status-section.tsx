interface StatusSectionProps {
	type: "loading" | "error";
	message?: string;
	onRetry?: () => void;
}

export default function StatusSection({
	type,
	message,
	onRetry,
}: StatusSectionProps) {
	const displayMessage =
		message || (type === "loading" ? "SCANNING DATASTREAM..." : "SIGNAL LOST");

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden relative font-sans text-white selection:bg-fuchsia-500/30 py-20">
			{/* 1. Starry Background Layer */}
			<div className="absolute inset-0 bg-black z-0">
				<div className="absolute inset-0 opacity-70 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
			</div>

			{/* 2. Retro Sun Section */}
			<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-linear-to-t from-yellow-400 via-pink-500 to-purple-600 blur-sm z-10 shadow-[0_0_50px_rgba(236,72,153,0.3)] opacity-50"></div>

			{/* 3. Moving Perspective Grid */}
			<div
				className="absolute bottom-0 w-full h-[30vh] z-20"
				style={{
					background:
						"linear-gradient(to bottom, transparent 0%, rgba(236, 72, 153, 0.1) 100%)",
					transform: "perspective(500px) rotateX(60deg)",
					transformOrigin: "bottom center",
				}}
			>
				<div
					className="absolute inset-0 animate-grid-move"
					style={{
						backgroundImage: `
                            linear-gradient(0deg, transparent 24%, rgba(236, 72, 153, .3) 25%, rgba(236, 72, 153, .3) 26%, transparent 27%, transparent 74%, rgba(236, 72, 153, .3) 75%, rgba(236, 72, 153, .3) 76%, transparent 77%, transparent),
                            linear-gradient(90deg, transparent 24%, rgba(236, 72, 153, .3) 25%, rgba(236, 72, 153, .3) 26%, transparent 27%, transparent 74%, rgba(236, 72, 153, .3) 75%, rgba(236, 72, 153, .3) 76%, transparent 77%, transparent)
                        `,
						backgroundSize: "60px 60px",
					}}
				/>
			</div>

			{/* 4. Content */}
			<div className="relative z-30 flex flex-col items-center justify-center px-4 text-center">
				<div className="mb-8">
					{type === "loading" ? (
						<div className="flex gap-2">
							{[0, 1, 2].map((i) => (
								<div
									key={i}
									className="w-3 h-3 bg-cyan-400 animate-pulse"
									style={{ animationDelay: `${i * 0.2}s` }}
								/>
							))}
						</div>
					) : (
						<div className="w-12 h-12 border-4 border-red-500 rounded-full flex items-center justify-center text-red-500 font-black text-2xl animate-bounce">
							!
						</div>
					)}
				</div>

				<h2
					className={`tracking-[0.2em] font-bold text-xl sm:text-2xl md:text-4xl mb-6 uppercase text-transparent bg-clip-text ${
						type === "loading"
							? "bg-linear-to-b from-cyan-400 to-blue-600"
							: "bg-linear-to-b from-red-500 to-red-800"
					}`}
					style={{
						textShadow: "2px 2px 0px rgba(0,0,0,1)",
					}}
				>
					{displayMessage}
				</h2>

				{type === "error" && onRetry && (
					<button
						type="button"
						onClick={onRetry}
						className="group relative px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-lg -skew-x-12 shadow-[5px_5px_0px_0px_rgba(34,211,238,1)] transition-transform hover:translate-y-1 active:translate-y-2 overflow-hidden"
					>
						<span className="relative z-10 block skew-x-12 uppercase">
							RECONNECT
						</span>
						<div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
					</button>
				)}
			</div>
		</div>
	);
}
