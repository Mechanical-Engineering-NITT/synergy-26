import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Synergy 2026",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Syne:wght@400..800&display=swap",
			},
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
				<script
					defer
					src="https://synergy.nitt.edu/analytics/script.js"
					data-website-id="e117a9c6-b7ee-46b3-bc5f-340d02735ef5"
				></script>
			</head>
			<body>
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
				<Toaster
					toastOptions={{
						unstyled: true,
						classNames: {
							toast:
								"group flex items-center gap-3 w-full max-w-[356px] p-4 bg-black text-white border border-cyan-500/50 font-mono uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(34,211,238,1)] transition-transform",
							title: "text-sm font-bold",
							description: "text-xs text-gray-400",
							success:
								"!border-cyan-500 !shadow-[4px_4px_0px_0px_rgba(34,211,238,1)]",
							error:
								"!border-red-600 !shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]",
						},
					}}
				/>
			</body>
		</html>
	);
}
