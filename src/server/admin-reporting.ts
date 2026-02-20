export type User = {
	id: string;
	name: string;
	email: string;
	role: string;
	onBoardingComplete: boolean | null;
	emailVerified: boolean;
	createdAt: Date;
};

export type Profile = {
	userId: string;
	fullname: string;
	phone: string;
	college: string;
	city: string;
	department: string;
	year: string;
	gender: string;
};

export type Registration = {
	userId: string;
	eventId: number | null;
	workshopId: number | null;
};

export type Payment = {
	userId: string;
	isEventPass: boolean | null;
	workshopId: number | null;
};

export function computeHasEventPassByUserId(
	users: Pick<User, "id">[],
	paidPayments: Payment[],
) {
	return Object.fromEntries(
		users.map((currentUser) => {
			const hasEventPass = paidPayments.some(
				(payment) =>
					payment.userId === currentUser.id &&
					(payment.isEventPass === true || payment.workshopId !== null),
			);

			return [currentUser.id, hasEventPass];
		}),
	) as Record<string, boolean>;
}

export function buildEventAudienceGroups({
	users,
	profiles,
	registrations,
	hasEventPassByUserId,
	eventId,
}: {
	users: User[];
	profiles: Profile[];
	registrations: Registration[];
	hasEventPassByUserId: Record<string, boolean>;
	eventId: number;
}) {
	const profilesByUserId = new Map(
		profiles.map((profile) => [profile.userId, profile]),
	);

	const explicitRegistrationUserIdSet = new Set(
		registrations
			.filter((registration) => registration.eventId === eventId)
			.map((registration) => registration.userId),
	);

	const mapUser = (currentUser: User) => {
		const profile = profilesByUserId.get(currentUser.id);
		return {
			...currentUser,
			profile: profile ?? null,
			hasEventPass: Boolean(hasEventPassByUserId[currentUser.id]),
			explicitlyRegistered: explicitRegistrationUserIdSet.has(currentUser.id),
		};
	};

	const eventPassEligibleUsers = users
		.filter((currentUser) => Boolean(hasEventPassByUserId[currentUser.id]))
		.map(mapUser);

	const explicitlyRegisteredUsers = users
		.filter((currentUser) => explicitRegistrationUserIdSet.has(currentUser.id))
		.map(mapUser);

	return {
		eventPassEligibleUsers,
		explicitlyRegisteredUsers,
	};
}
