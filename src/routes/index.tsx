import Sample from "@/components/Sample";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div>
			<span className="text-2xl font-bold text-center">
				Hello World! This is Synergy 2026!
			</span>
			<Sample />
		</div>
	);
}
