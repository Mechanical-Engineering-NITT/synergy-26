import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function Navbar({
	user,
	isFixed = true,
}: {
	user: {
		id: string;
		email: string;
		name: string;
	} | null;
	isFixed?: boolean;
}) {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const navPositionClass = isFixed
		? "fixed top-0 left-0 right-0 z-100"
		: "relative z-100";

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const navLinks = [
		{ name: "About Us", href: "#about" },
		{ name: "Schedule", href: "#schedule" },
		{ name: "What's New", href: "#pricing" },
		{ name: "Events", href: "#events" },
		{ name: "Workshops", href: "#workshops" },
		{ name: "Pre-Fest", href: "#pre-fest" },
		{ name: "Accommodation", href: "#accommodation" },
	];

	const handleLinkClick = (href: string) => {
		setIsOpen(false);
		if (window.location.pathname !== "/") {
			navigate({ to: "/", hash: href.replace("#", "") });
			return;
		}
		const element = document.querySelector(href);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
	};

	return (
		<nav
			className={`${navPositionClass} transition-all duration-300 ${
				scrolled || isOpen
					? "bg-[#090521]/40 backdrop-blur-xl border-b border-white/10 py-1"
					: "bg-transparent py-3"
			}`}
		>
			<div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-12">
					{/* Logo & Links Group */}
					<div className="flex items-center gap-6 xl:gap-10">
						<div className="shrink-0 flex items-center gap-3">
							<Link to="/" className="flex items-center gap-3">
								<img
									src="/nitt.webp"
									alt="NITT Logo"
									className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-transform duration-300"
								/>
								<img
									src="/slogo.webp"
									alt="Synergy Logo"
									className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(0,255,249,0.5)] transition-transform duration-300"
								/>
							</Link>
						</div>

						{/* Desktop Links */}
						<div className="hidden lg:block">
							<div className="flex items-center space-x-2 xl:space-x-4">
								{navLinks.map((link) => (
									<button
										key={link.name}
										type="button"
										onClick={() => handleLinkClick(link.href)}
										className="text-gray-300 hover:text-[#00FFF9] px-2 py-2 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
									>
										{link.name}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Desktop Auth Actions */}
					<div className="hidden lg:flex items-center gap-4 shrink-0">
						{user ? (
							<>
								<Link
									to="/tickets"
									className="px-6 py-2 bg-linear-to-r from-red-600 to-red-800 text-white font-black text-xs uppercase tracking-widest -skew-x-12 hover:shadow-[4px_4px_0px_0px_rgba(34,211,238,1)] transition-all hover:translate-y-0.5"
								>
									<span className="block skew-x-12">My Tickets</span>
								</Link>
								<Link
									to="/profile"
									className="px-6 py-2 bg-[#FFDD00] text-black font-black text-xs uppercase tracking-widest -skew-x-12 hover:shadow-[4px_4px_0px_0px_rgba(255,46,99,1)] transition-all hover:translate-y-0.5"
								>
									<span className="block skew-x-12">Profile</span>
								</Link>
							</>
						) : (
							<button
								type="button"
								onClick={async () => {
									await authClient.signIn.social({
										provider: "google",
									});
								}}
								className="px-6 py-2 bg-[#FF2E63] text-white font-black text-xs uppercase tracking-widest -skew-x-12 hover:shadow-[4px_4px_0px_0px_rgba(0,255,249,1)] transition-all hover:translate-y-0.5"
							>
								<span className="block skew-x-12">Sign In</span>
							</button>
						)}
					</div>

					{/* Mobile menu button */}
					<div className="lg:hidden flex items-center">
						<button
							type="button"
							onClick={() => setIsOpen(!isOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-[#00FFF9] focus:outline-none"
						>
							{isOpen ? <X size={28} /> : <Menu size={28} />}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Menu */}
			<div
				className={`lg:hidden absolute top-full left-0 right-0 bg-[#090521]/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300 ease-in-out transform ${
					isOpen
						? "opacity-100 translate-y-0"
						: "opacity-0 -translate-y-4 pointer-events-none"
				}`}
			>
				<div className="px-4 pt-2 pb-6 space-y-2 text-center">
					{navLinks.map((link) => (
						<button
							key={link.name}
							type="button"
							onClick={() => handleLinkClick(link.href)}
							className="text-gray-300 hover:text-[#00FFF9] block px-3 py-4 text-sm font-black uppercase tracking-widest w-full transition-colors"
						>
							{link.name}
						</button>
					))}
					<div className="pt-4 border-t border-white/5">
						{user ? (
							<>
								<Link
									to="/tickets"
									onClick={() => setIsOpen(false)}
									className="block w-full py-4 text-cyan-400 font-black uppercase tracking-widest border-b border-white/5"
								>
									My Tickets
								</Link>
								<Link
									to="/profile"
									onClick={() => setIsOpen(false)}
									className="block w-full py-4 text-[#FFDD00] font-black uppercase tracking-widest"
								>
									Profile: {user.name}
								</Link>
							</>
						) : (
							<button
								type="button"
								onClick={async () => {
									await authClient.signIn.social({
										provider: "google",
									});
								}}
								className="block w-full py-4 text-[#FF2E63] font-black uppercase tracking-widest"
							>
								Sign In with Google
							</button>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
