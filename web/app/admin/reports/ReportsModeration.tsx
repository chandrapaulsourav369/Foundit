"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { adminListReportsAction, adminUpdateReportAction } from "@/lib/admin/actions";
import { getPostAction } from "@/lib/posts/actions";
import { Post } from "@/types/post";
import { Report, REPORT_REASONS, ReportStatus } from "@/types/social";

export default function ReportsModeration() {
	const [reports, setReports] = useState<Report[]>([]);
	const [postsById, setPostsById] = useState<Record<string, Post>>({});
	const [selectedId, setSelectedId] = useState("");
	const [note, setNote] = useState("");

	useEffect(() => {
		adminListReportsAction().then(async result => {
			if (!result.success || !result.data) return;
			setReports(result.data.reports);
			setSelectedId(result.data.reports[0]?.id ?? "");

			const uniquePostIds = [...new Set(result.data.reports.map(r => r.postId))];
			const postResults = await Promise.all(
				uniquePostIds.map(id => getPostAction(id)),
			);
			const map: Record<string, Post> = {};
			postResults.forEach((r, i) => {
				if (r.success && r.data) map[uniquePostIds[i]] = r.data.post;
			});
			setPostsById(map);
		});
	}, []);

	const selected = reports.find(r => r.id === selectedId);
	const selectedPost = selected ? postsById[selected.postId] : undefined;

	async function updateStatus(status: ReportStatus) {
		if (!selected) return;
		const result = await adminUpdateReportAction(selected.id, {
			status,
			adminResponse: note || undefined,
		});
		if (!result.success) {
			toast.error(result.message || "Failed to update report");
			return;
		}
		setReports(prev =>
			prev.map(r =>
				r.id === selected.id
					? { ...r, status, adminResponse: note || r.adminResponse }
					: r,
			),
		);
		toast.success(`Report marked as ${status.toLowerCase()}`);
	}

	return (
		<div className='grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]'>
			<div className='divide-y rounded-lg border'>
				{reports.map(report => (
					<button
						key={report.id}
						onClick={() => {
							setSelectedId(report.id);
							setNote(report.adminResponse ?? "");
						}}
						className={cn(
							"block w-full px-4 py-3 text-left transition-colors hover:bg-accent",
							selectedId === report.id && "bg-accent",
						)}
					>
						<div className='flex items-center justify-between gap-2'>
							<span className='truncate text-sm font-medium'>
								{postsById[report.postId]?.title ?? "Listing"}
							</span>
							<StatusBadge status={report.status} />
						</div>
						<p className='mt-1 truncate text-xs text-muted-foreground'>
							{REPORT_REASONS.find(r => r.value === report.reason)?.label ??
								report.reason}
						</p>
					</button>
				))}
			</div>

			{selected && (
				<div className='space-y-5 rounded-lg border p-6'>
					<div>
						<h2 className='text-lg font-semibold'>
							{REPORT_REASONS.find(r => r.value === selected.reason)?.label ??
								selected.reason}
						</h2>
						<p className='mt-1 text-sm text-muted-foreground'>
							Submitted{" "}
							{new Date(selected.createdAt).toLocaleDateString(undefined, {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</p>
					</div>

					<div className='rounded-md border bg-muted/40 p-4'>
						<p className='text-xs font-medium text-muted-foreground'>
							Reported content
						</p>
						<Link
							href={`/posts/${selected.postId}`}
							className='mt-1 block text-sm font-semibold hover:underline'
						>
							{selectedPost?.title ?? "Listing"}
						</Link>
						{selectedPost && (
							<StatusBadge status={selectedPost.status} className='mt-2' />
						)}
						{selected.details && (
							<p className='mt-3 text-sm'>{selected.details}</p>
						)}
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Status</label>
						<Select
							value={selected.status}
							onValueChange={v => updateStatus(v as ReportStatus)}
						>
							<SelectTrigger className='w-48'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='PENDING'>Pending</SelectItem>
								<SelectItem value='REVIEWING'>Reviewing</SelectItem>
								<SelectItem value='RESOLVED'>Resolved</SelectItem>
								<SelectItem value='REJECTED'>Rejected</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Admin notes</label>
						<Textarea
							value={note}
							onChange={e => setNote(e.target.value)}
							rows={4}
							placeholder='Add a note visible to the reporter...'
						/>
					</div>

					<div className='flex gap-2'>
						<Button onClick={() => updateStatus("RESOLVED")}>Resolve</Button>
						<Button variant='outline' onClick={() => updateStatus("REJECTED")}>
							Reject
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
