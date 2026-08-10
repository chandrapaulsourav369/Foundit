"use server";
import { Session } from "@/types/auth";
import { ApiEnvelope } from "@/types/post";
import { MyProfile } from "@/types/user";
import { authFetch } from "./authFetch";
import { getSession } from "./session";

export const getProfile = async (): Promise<
	ApiEnvelope<{ user: MyProfile }>
> => {
	const response = await authFetch(`/api/user/me`);

	const result = await response.json();
	return result;
};

export type SessionState = {
	isAuthenticated: boolean;
	user: Session | null;
	error?: string;
};

export const getSessionState = async (): Promise<SessionState> => {
	try {
		const user = await getSession();
		if (!user) {
			return {
				isAuthenticated: false,
				user: null,
				error: "No active session",
			};
		}
		return { isAuthenticated: true, user };
	} catch {
		return {
			isAuthenticated: false,
			user: null,
			error: "Unable to verify session",
		};
	}
};
