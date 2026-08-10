export type UserPreference = {
	theme: string;
};

export type MyProfile = {
	id: string;
	email: string;
	name: string;
	avatarUrl: string | null;
	userBodyImageUrl: string | null;
	bio: string | null;
	age: number | null;
	gender: string | null;
	location: string | null;
	interests: string[];
	emailVerified: boolean;
	isActive: boolean;
};
