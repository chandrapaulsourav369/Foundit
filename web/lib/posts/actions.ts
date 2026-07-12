"use server";

import { BACKEND_URL } from "@/constants/constants";
import { authFetch } from "@/lib/auth/authFetch";
import {
	ApiEnvelope,
	Post,
	PostFormInput,
	PostListResult,
} from "@/types/post";

export type ListPostsParams = {
	cursor?: string;
	limit?: number;
	search?: string;
	category?: string;
	status?: string;
	resolved?: boolean;
};

export async function listPostsAction(
	params: ListPostsParams = {},
): Promise<ApiEnvelope<PostListResult>> {
	const query = new URLSearchParams();
	if (params.cursor) query.set("cursor", params.cursor);
	if (params.limit) query.set("limit", String(params.limit));
	if (params.search) query.set("search", params.search);
	if (params.category) query.set("category", params.category);
	if (params.status) query.set("status", params.status);
	if (params.resolved !== undefined)
		query.set("resolved", String(params.resolved));

	const response = await fetch(
		`${BACKEND_URL}/api/posts?${query.toString()}`,
		{ cache: "no-store" },
	);
	return response.json();
}

export async function getPostAction(
	id: string,
): Promise<ApiEnvelope<{ post: Post }>> {
	const response = await fetch(`${BACKEND_URL}/api/posts/${id}`, {
		cache: "no-store",
	});
	return response.json();
}

export async function createPostAction(
	input: PostFormInput,
): Promise<ApiEnvelope<{ post: Post }>> {
	const response = await authFetch(`/api/posts`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	return response.json();
}

export async function updatePostAction(
	id: string,
	input: Partial<PostFormInput>,
): Promise<ApiEnvelope<{ post: Post }>> {
	const response = await authFetch(`/api/posts/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	return response.json();
}

export async function resolvePostAction(
	id: string,
	isResolved: boolean,
): Promise<ApiEnvelope<{ post: Post }>> {
	const response = await authFetch(`/api/posts/${id}/resolve`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ isResolved }),
	});
	return response.json();
}

export async function deletePostAction(
	id: string,
): Promise<ApiEnvelope<null>> {
	const response = await authFetch(`/api/posts/${id}`, {
		method: "DELETE",
	});
	return response.json();
}
