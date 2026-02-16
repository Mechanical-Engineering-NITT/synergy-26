import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function Navbar({
	user,
}: {
	user: {
		id: string;
		email: string;
		name: string;
	} | null;
}) {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const navLinks = [
		{ name: "What's New", href: "#pricing" },
		{ name: "Events", href: "#events" },
		{ name: "Workshops", href: "#workshops" },
		{ name: "Reel Challenge", href: "#reel-challenge" },
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
			className={`fixed top-0 left-0 right-0 z-100 transition-all duration-300 ${
				scrolled || isOpen
					? "bg-[#090521]/40 backdrop-blur-xl border-b border-white/10 py-1"
					: "bg-transparent py-3"
			}`}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-12">
					{/* Logo */}
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
					<div className="hidden md:block">
						<div className="ml-10 flex items-baseline space-x-8">
							{navLinks.map((link) => (
								<button
									key={link.name}
									type="button"
									onClick={() => handleLinkClick(link.href)}
									className="text-gray-300 hover:text-[#00FFF9] px-3 py-2 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
								>
									{link.name}
								</button>
							))}
							{user ? (
								<div className="flex items-center gap-4">
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
								</div>
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
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden flex items-center">
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
				className={`md:hidden absolute top-full left-0 right-0 bg-[#090521]/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300 ease-in-out transform ${
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
