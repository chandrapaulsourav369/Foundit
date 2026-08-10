"use server";

import { authFetch } from "@/lib/auth/authFetch";
import { ApiEnvelope } from "@/types/post";
import { Notification } from "@/types/social";

export async function listNotificationsAction(): Promise<
	ApiEnvelope<{
		notifications: Notification[];
		nextCursor: string | null;
		unreadCount: number;
	}>
> {
	const response = await authFetch(`/api/notifications`, { cache: "no-store" });
	return response.json();
}

export async function markNotificationReadAction(
	id: string,
): Promise<ApiEnvelope<null>> {
	const response = await authFetch(`/api/notifications/${id}/read`, {
		method: "PATCH",
	});
	return response.json();
}

export async function markAllNotificationsReadAction(): Promise<
	ApiEnvelope<null>
> {
	const response = await authFetch(`/api/notifications/read-all`, {
		method: "PATCH",
	});
	return response.json();
}
