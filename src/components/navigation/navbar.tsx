/** biome-ignore-all lint/a11y/noStaticElementInteractions: navigation implementation */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: navigation implementation */
"use client";

import { Link } from "@tanstack/react-router";
import React, { useEffect } from "react";
import SignInBtn from "./signinbtn";
import SignOutBtn from "./signoutbtn";

export default function Navigation({ isUser }: { isUser: boolean }) {
	const [isOpen, setIsOpen] = React.useState(false);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1280) {
				setIsOpen(false);
			}
		};

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);
	return (
		<>
			<Navbar
				isUser={isUser}
				onToggleSidebar={() => setIsOpen((prev) => !prev)}
			/>
			<Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
		</>
	);
}

function Sidebar({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const overlayClassName = `fixed inset-0 top-0 left-0 w-screen h-screen bg-black/40 z-40 transition-opacity duration-300 ease-in-out xl:hidden ${
		isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
	}`;

	const sidebarClassName = `flex flex-col fixed top-0 left-0 max-w-80 h-screen w-screen z-50 bg-gray-100 p-0 transition-transform duration-300 ease-in-out xl:hidden xl:transform-none ${
		isOpen ? "translate-x-0" : "-translate-x-full"
	}`;

	return (
		<>
			<div className={overlayClassName} onClick={() => setIsOpen(false)}></div>
			<aside className={sidebarClassName}>
				<div className="flex w-full h-[70px] items-center border-b border-gray-200">
					<Link
						to={"/"}
						className="px-[15px] h-[70px] flex items-center gap-5 justify-start"
					>
						<div className="logoBg bg-black rounded-full max-w-[50px] max-h-[50px] h-full aspect-square flex items-center justify-center">
							{/* Image */}
						</div>
						<div className="font-montserrat font-semibold text-2xl title">
							Text
						</div>
					</Link>
					<button
						type="button"
						className="ml-auto h-full w-fit p-4 flex items-center justify-center shrink-0"
						onClick={() => setIsOpen(false)}
					>
						{/* Close btn */} X
					</button>
				</div>
				<nav className="mt-10 w-full flex gap-5 justify-start flex-col p-0 font-montserrat text-2xl font-medium text-gray-950">
					{/* Nav Links */}
				</nav>
			</aside>
		</>
	);
}

function Navbar({
	isUser,
	onToggleSidebar,
}: {
	isUser: boolean;
	onToggleSidebar: () => void;
}) {
	return (
		<>
			<header className="fixed inset-x-0 top-0 h-[70px] xl:h-16 w-full flex items-center justify-between px-10 z-40 shadow-md bg-bg">
				<button
					type="button"
					className="openBtn flex items-center justify-center shrink-0 xl:hidden"
					onClick={onToggleSidebar}
				>
					{/* Hamburger Icon */} 3
				</button>
				<Link
					to={"/"}
					className="px-[15px] h-[70px] xl:h-20 flex items-center gap-5 justify-start"
				>
					<div className="logoBg bg-transparent rounded-full size-[70px] xl:size-20 flex items-center justify-center">
						{/* Image */}
					</div>
					<div className="font-montserrat font-semibold text-2xl title hidden md:flex text-white">
						Text
					</div>
				</Link>

				{/* Nav links */}

				{isUser ? <SignInBtn /> : <SignOutBtn />}
			</header>
			<div className="h-[70px] xl:h-20 w-full" aria-hidden="true" />
		</>
	);
}
