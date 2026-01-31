import { authClient } from "@/lib/auth-client";

export default function SignInBtn() {
	return (
		<div className="scanlines-hover absolute rounded-md font-display text-gray-100 glow-hover hover:[background:var(--color-pink-glow)] hover:text-text-pink">
			<button
				type="button"
				className="px-2 py-1 tracking-widest text-sm"
				onClick={async () => {
					await authClient.signIn.social({
						provider: "google",
					});
				}}
			>
				SIGN IN
			</button>
		</div>
	);
}
