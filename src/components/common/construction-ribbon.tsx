export default function ConstructionRibbon() {
	return (
		<div className="fixed top-0 left-0 z-9999 pointer-events-none overflow-hidden w-32 h-32 sm:w-40 sm:h-40">
			<div className="px-5 bg-[#FFDD00] text-black font-black text-[10px] sm:text-xs uppercase py-1.5 text-center absolute top-6 sm:top-8 -left-10 sm:-left-12 w-44 sm:w-52 -rotate-45 shadow-[0_0_20px_rgba(255,221,0,0.3)] border-y-2 border-black/20 tracking-[0.2em] italic">
				Under Construction
			</div>
		</div>
	);
}
