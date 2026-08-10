"use server";

import { authFetch } from "@/lib/auth/authFetch";
import { ApiEnvelope } from "@/types/post";
import { Report, ReportReason } from "@/types/social";

export async function createReportAction(
	postId: string,
	reason: ReportReason,
	details?: string,
): Promise<ApiEnvelope<{ report: Report }>> {
	const response = await authFetch(`/api/reports`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ postId, reason, details }),
	});
	return response.json();
}

export async function listMyReportsAction(): Promise<
	ApiEnvelope<{ reports: Report[] }>
> {
	const response = await authFetch(`/api/reports/mine`, { cache: "no-store" });
	return response.json();
}
