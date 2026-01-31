import { authClient } from "@/lib/auth-client";

export default function SignOutBtn() {
	return (
		<button
			type="button"
			className="bg-gray-200 p-2 hover:opacity-75 rounded-md border-2 border-gray-950"
			onClick={async () => {
				await authClient.signOut();
				window.location.reload();
			}}
		>
			Sign Out
		</button>
	);
}
