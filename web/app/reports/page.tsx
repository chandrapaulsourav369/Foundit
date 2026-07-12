import Link from "next/link";
import { FileWarning } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { mockReports } from "@/lib/mock-data";

export default function MyReportsPage() {
	return (
		<main className='mx-auto max-w-3xl px-4 py-8'>
			<h1 className='text-2xl font-semibold'>My Reports</h1>
			<p className='mt-1 text-sm text-muted-foreground'>
				Reports you&apos;ve submitted and their moderation status.
			</p>

			{mockReports.length === 0 ? (
				<div className='mt-6'>
					<EmptyState icon={FileWarning} title='No reports submitted yet' />
				</div>
			) : (
				<div className='mt-6 space-y-3'>
					{mockReports.map(report => (
						<div key={report.id} className='rounded-lg border p-4'>
							<div className='flex flex-wrap items-center justify-between gap-2'>
								<Link
									href={`/posts/${report.post.id}`}
									className='text-sm font-semibold hover:underline'
								>
									{report.post.title}
								</Link>
								<StatusBadge status={report.status} />
							</div>
							<p className='mt-2 text-sm'>
								<span className='font-medium'>Reason:</span> {report.reason}
							</p>
							{report.details && (
								<p className='mt-1 text-sm text-muted-foreground'>
									{report.details}
								</p>
							)}
							<p className='mt-2 text-xs text-muted-foreground'>
								Submitted{" "}
								{new Date(report.submittedAt).toLocaleDateString(undefined, {
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
					))}
				</div>
			)}
		</main>
	);
}
