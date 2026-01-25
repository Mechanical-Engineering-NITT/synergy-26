import { Link } from "@tanstack/react-router";

export default function Footer() {
	return (
		<footer className="w-full bg-white border-t border-gray-200 pt-12 pb-8 mt-auto">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
					{/* About Section */}
					<div className="space-y-4">
						<h3 className="text-lg font-bold text-black uppercase tracking-wider">
							Synergy 2026
						</h3>
						<p className="text-black text-sm leading-relaxed">
							Mechanical Engineering Association,
							<br />
							Department of Mechanical Engineering,
							<br />
							NIT Trichy.
						</p>
					</div>

					{/* Archive Section */}
					<div className="space-y-4">
						<h3 className="text-lg font-bold text-black uppercase tracking-wider">
							Archives
						</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<a
									href="https://synergy.nitt.edu/25"
									target="_blank"
									rel="noopener noreferrer"
									className="text-black hover:underline transition-colors"
								>
									Synergy '25
								</a>
							</li>
							<li>
								<a
									href="https://synergy.nitt.edu/24"
									target="_blank"
									rel="noopener noreferrer"
									className="text-black hover:underline transition-colors"
								>
									Synergy '24
								</a>
							</li>
						</ul>
					</div>

					{/* Contact Section */}
					<div className="space-y-4">
						<h3 className="text-lg font-bold text-black uppercase tracking-wider">
							Contact Us
						</h3>
						<div className="text-black text-sm space-y-2">
							<p>
								<span className="font-semibold">Email:</span>{" "}
								<a
									href="mailto:mech.nitt.dev@gmail.com"
									className="text-blue-600 hover:underline transition-colors"
								>
									mech.nitt.dev@gmail.com
								</a>
							</p>
							<p>
								<span className="font-semibold">Phone:</span>{" "}
								<a
									href="tel:+918610999139"
									className="text-blue-600 hover:underline transition-colors"
								>
									+91 8610999139
								</a>
							</p>
							<p className="mt-4">
								<span className="font-semibold">Address:</span>
								<br />
								Department of Mechanical Engineering,
								<br />
								NIT Trichy, Thanjavur Road,
								<br />
								Trichy - 620015.
							</p>
						</div>
					</div>

					{/* Compliance Links */}
					<div className="space-y-4">
						<h3 className="text-lg font-bold text-black uppercase tracking-wider">
							Compliance
						</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									to="/terms-and-conditions"
									className="text-black hover:underline transition-colors"
								>
									Terms and Conditions
								</Link>
							</li>
							<li>
								<Link
									to="/privacy-policy"
									className="text-black hover:underline transition-colors"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									to="/refund-policy"
									className="text-black hover:underline transition-colors"
								>
									Refund Policy
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="border-t border-gray-200 pt-8 text-center space-y-4">
					<p className="text-black text-xs opacity-75">
						&copy; {new Date().getFullYear()} MEA NIT Trichy. All rights
						reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
