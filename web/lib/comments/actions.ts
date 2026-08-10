"use server";

import { BACKEND_URL } from "@/constants/constants";
import { authFetch } from "@/lib/auth/authFetch";
import { ApiEnvelope } from "@/types/post";
import { Comment } from "@/types/social";

export async function listCommentsAction(
	postId: string,
): Promise<ApiEnvelope<{ comments: Comment[]; nextCursor: string | null }>> {
	const response = await fetch(`${BACKEND_URL}/api/posts/${postId}/comments`, {
		cache: "no-store",
	});
	return response.json();
}

export async function createCommentAction(
	postId: string,
	body: string,
): Promise<ApiEnvelope<{ comment: Comment }>> {
	const response = await authFetch(`/api/posts/${postId}/comments`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ body }),
	});
	return response.json();
}

export async function deleteCommentAction(
	postId: string,
	commentId: string,
): Promise<ApiEnvelope<null>> {
	const response = await authFetch(
		`/api/posts/${postId}/comments/${commentId}`,
		{ method: "DELETE" },
	);
	return response.json();
}
