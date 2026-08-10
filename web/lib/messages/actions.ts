"use server";

import { authFetch } from "@/lib/auth/authFetch";
import { ApiEnvelope } from "@/types/post";
import { Conversation, Message } from "@/types/social";

export async function createConversationAction(
	postId: string,
): Promise<ApiEnvelope<{ conversation: Conversation }>> {
	const response = await authFetch(`/api/conversations`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ postId }),
	});
	return response.json();
}

export async function listConversationsAction(): Promise<
	ApiEnvelope<{ conversations: Conversation[] }>
> {
	const response = await authFetch(`/api/conversations`, {
		cache: "no-store",
	});
	return response.json();
}

export async function listMessagesAction(
	conversationId: string,
): Promise<ApiEnvelope<{ messages: Message[]; nextCursor: string | null }>> {
	const response = await authFetch(
		`/api/conversations/${conversationId}/messages`,
		{ cache: "no-store" },
	);
	return response.json();
}

export async function sendMessageAction(
	conversationId: string,
	body: string,
): Promise<ApiEnvelope<{ message: Message }>> {
	const response = await authFetch(
		`/api/conversations/${conversationId}/messages`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ body }),
		},
	);
	return response.json();
}

export async function markConversationReadAction(
	conversationId: string,
): Promise<ApiEnvelope<null>> {
	const response = await authFetch(`/api/conversations/${conversationId}/read`, {
		method: "PATCH",
	});
	return response.json();
}
