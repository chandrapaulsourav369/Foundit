"use server";

import { authFetch } from "@/lib/auth/authFetch";
import { ApiEnvelope, Post } from "@/types/post";
import { AdminPostRow, AdminUserRow, Report, ReportStatus } from "@/types/social";

export async function adminStatsAction(): Promise<
	ApiEnvelope<{
		stats: {
			totalUsers: number;
			totalPosts: number;
			resolvedPosts: number;
			openReports: number;
		};
	}>
> {
	const response = await authFetch(`/api/admin/stats`, { cache: "no-store" });
	return response.json();
}

export async function adminListPostsAction(
	params: { search?: string; status?: string } = {},
): Promise<ApiEnvelope<{ posts: AdminPostRow[]; nextCursor: string | null }>> {
	const query = new URLSearchParams();
	if (params.search) query.set("search", params.search);
	if (params.status) query.set("status", params.status);
	query.set("deleted", "all");
	query.set("limit", "50");

	const response = await authFetch(`/api/admin/posts?${query.toString()}`, {
		cache: "no-store",
	});
	return response.json();
}

export async function adminRemovePostAction(id: string): Promise<ApiEnvelope<null>> {
	const response = await authFetch(`/api/admin/posts/${id}/remove`, {
		method: "PATCH",
	});
	return response.json();
}

export async function adminRestorePostAction(
	id: string,
): Promise<ApiEnvelope<{ post: Post }>> {
	const response = await authFetch(`/api/admin/posts/${id}/restore`, {
		method: "PATCH",
	});
	return response.json();
}

export async function adminListUsersAction(): Promise<
	ApiEnvelope<{ users: AdminUserRow[]; nextCursor: string | null }>
> {
	const response = await authFetch(`/api/admin/users?limit=50`, {
		cache: "no-store",
	});
	return response.json();
}

export async function adminUpdateUserStatusAction(
	id: string,
	status: "ACTIVE" | "BANNED",
): Promise<ApiEnvelope<{ user: AdminUserRow }>> {
	const response = await authFetch(`/api/admin/users/${id}/status`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ status }),
	});
	return response.json();
}

export async function adminListReportsAction(): Promise<
	ApiEnvelope<{ reports: Report[]; nextCursor: string | null }>
> {
	const response = await authFetch(`/api/admin/reports?limit=50`, {
		cache: "no-store",
	});
	return response.json();
}

export async function adminUpdateReportAction(
	id: string,
	data: { status?: ReportStatus; adminResponse?: string },
): Promise<ApiEnvelope<{ report: Report }>> {
	const response = await authFetch(`/api/admin/reports/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	return response.json();
}
