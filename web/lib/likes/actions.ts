"use server";

import { authFetch } from "@/lib/auth/authFetch";
import { ApiEnvelope } from "@/types/post";

export async function toggleLikeAction(
	postId: string,
): Promise<ApiEnvelope<{ liked: boolean; likeCount: number }>> {
	const response = await authFetch(`/api/posts/${postId}/like`, {
		method: "POST",
	});
	return response.json();
}
