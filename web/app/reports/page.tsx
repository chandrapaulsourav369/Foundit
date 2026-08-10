import Link from "next/link";
import { FileWarning } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { listMyReportsAction } from "@/lib/reports/actions";
import { getPostAction } from "@/lib/posts/actions";
import { REPORT_REASONS } from "@/types/social";

export default async function MyReportsPage() {
	const result = await listMyReportsAction();
	const reports = result.success && result.data ? result.data.reports : [];

	const posts = await Promise.all(
		reports.map(async report => {
			const postResult = await getPostAction(report.postId);
			return postResult.success && postResult.data
				? postResult.data.post
				: null;
		}),
	);

	return (
		<main className='mx-auto max-w-3xl px-4 py-8'>
			<h1 className='text-2xl font-semibold'>My Reports</h1>
			<p className='mt-1 text-sm text-muted-foreground'>
				Reports you&apos;ve submitted and their moderation status.
			</p>

			{reports.length === 0 ? (
				<div className='mt-6'>
					<EmptyState icon={FileWarning} title='No reports submitted yet' />
				</div>
			) : (
				<div className='mt-6 space-y-3'>
					{reports.map((report, i) => {
						const post = posts[i];
						const reasonLabel =
							REPORT_REASONS.find(r => r.value === report.reason)?.label ??
							report.reason;

						return (
							<div key={report.id} className='rounded-lg border p-4'>
								<div className='flex flex-wrap items-center justify-between gap-2'>
									<Link
										href={`/posts/${report.postId}`}
										className='text-sm font-semibold hover:underline'
									>
										{post?.title ?? "Listing"}
									</Link>
									<StatusBadge status={report.status} />
								</div>
								<p className='mt-2 text-sm'>
									<span className='font-medium'>Reason:</span> {reasonLabel}
								</p>
								{report.details && (
									<p className='mt-1 text-sm text-muted-foreground'>
										{report.details}
									</p>
								)}
								<p className='mt-2 text-xs text-muted-foreground'>
									Submitted{" "}
									{new Date(report.createdAt).toLocaleDateString(undefined, {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</p>
								{report.adminResponse && (
									<div className='mt-3 rounded-md bg-muted/50 px-3 py-2 text-sm'>
										<span className='font-medium'>Admin response:</span>{" "}
										{report.adminResponse}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</main>
	);
}
