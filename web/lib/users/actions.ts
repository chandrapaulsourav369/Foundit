"use server";

import { revalidatePath } from "next/cache";
import { BACKEND_URL } from "@/constants/constants";
import { authFetch } from "@/lib/auth/authFetch";
import { ApiEnvelope } from "@/types/post";
import { PublicUser, ProfilePost } from "@/types/social";
import { MyProfile } from "@/types/user";

export type UpdateProfileInput = {
	name?: string;
	bio?: string;
	location?: string;
};

export async function updateProfileAction(
	input: UpdateProfileInput,
): Promise<ApiEnvelope<{ user: MyProfile }>> {
	const response = await authFetch(`/api/user/me`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	const result = await response.json();
	if (result.success) revalidatePath("/user/dashboard");
	return result;
}

export type ChangePasswordInput = {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
};

export async function changePasswordAction(
	input: ChangePasswordInput,
): Promise<ApiEnvelope<undefined>> {
	const response = await authFetch(`/api/user/change-password`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	return response.json();
}

export async function getUserProfileAction(
	id: string,
): Promise<ApiEnvelope<{ user: PublicUser }>> {
	const response = await fetch(`${BACKEND_URL}/api/user/${id}/profile`, {
		cache: "no-store",
	});
	return response.json();
}

export async function listUserListingsAction(
	id: string,
): Promise<ApiEnvelope<{ posts: ProfilePost[]; nextCursor: string | null }>> {
	const response = await fetch(`${BACKEND_URL}/api/user/${id}/listings`, {
		cache: "no-store",
	});
	return response.json();
}
