import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { registerUser } from "@/server/registration";

export const Route = createFileRoute("/register/")({
	component: Register,
	loader: async () => {
		const { getSession } = await import("@/server/session");
		const { getAppUserByUserID } = await import("@/server/db-user-select");
		const session = await getSession();
		if (!session) {
			throw redirect({
				to: "/",
			});
		}

		if (session.user.onBoardingComplete) {
			throw redirect({
				to: "/",
			});
		}
		const appUser = await getAppUserByUserID(session.user.id);
		return appUser;
	},
});

function Register() {
	const nav = useNavigate();
	const appUser = Route.useLoaderData();
	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			fullname: formData.get("fullname") as string,
			college: formData.get("college") as string,
			city: formData.get("city") as string,
			department: formData.get("department") as string,
			year: formData.get("year") as string,
			phone: formData.get("phone") as string,
			gender: formData.get("gender") as "male" | "female" | "other",
		};
		try {
			await registerUser({ data });
			nav({ to: "/" });
		} catch (error) {
			throw new Error(`Registration failed: ${error}`);
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-4 max-w-md mx-auto mt-10"
		>
			<h1 className="text-2xl font-bold mb-4">Complete Your Registration</h1>
			<div>
				<label className="block mb-1 font-medium" htmlFor="fullname">
					Full Name
				</label>
				<input
					className="w-full border border-gray-300 rounded px-3 py-2"
					type="text"
					defaultValue={appUser?.fullname ?? ""}
					name="fullname"
				/>
			</div>
			<div>
				<label className="block mb-1 font-medium" htmlFor="college">
					College
				</label>
				<input
					className="w-full border border-gray-300 rounded px-3 py-2"
					type="text"
					name="college"
				/>
			</div>
			<div>
				<label className="block mb-1 font-medium" htmlFor="city">
					City
				</label>
				<input
					className="w-full border border-gray-300 rounded px-3 py-2"
					type="text"
					name="city"
				/>
			</div>
			<div>
				<label className="block mb-1 font-medium" htmlFor="department">
					Department
				</label>
				<input
					className="w-full border border-gray-300 rounded px-3 py-2"
					type="text"
					name="department"
				/>
			</div>
			<div>
				<label className="block mb-1 font-medium" htmlFor="year">
					Year
				</label>
				<input
					className="w-full border border-gray-300 rounded px-3 py-2"
					type="text"
					name="year"
				/>
			</div>
			<div>
				<label className="block mb-1 font-medium" htmlFor="phone">
					Phone
				</label>
				<input
					className="w-full border border-gray-300 rounded px-3 py-2"
					type="text"
					name="phone"
				/>
			</div>
			<div>
				<label className="block mb-1 font-medium" htmlFor="gender">
					Gender
				</label>
				<select
					className="w-full border border-gray-300 rounded px-3 py-2"
					name="gender"
				>
					<option value="male">Male</option>
					<option value="female">Female</option>
					<option value="other">Other</option>
				</select>
			</div>
			<button
				className="bg-blue-500 text-white px-4 py-2 rounded"
				type="submit"
			>
				Submit
			</button>
		</form>
	);
}
