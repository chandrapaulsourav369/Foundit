import Link from "next/link";
import { PackageSearch } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { ProfilePost } from "@/types/social";

export default function UserPostGrid({
	posts,
	emptyTitle = "No posts yet",
	emptyDescription,
}: {
	posts: ProfilePost[];
	emptyTitle?: string;
	emptyDescription?: string;
}) {
	if (posts.length === 0) {
		return (
			<EmptyState
				icon={PackageSearch}
				title={emptyTitle}
				description={emptyDescription}
			/>
		);
	}

	return (
		<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
			{posts.map(post => (
				<Link
					key={post.id}
					href={`/posts/${post.id}`}
					className='block rounded-lg border p-4 transition-colors hover:bg-accent'
				>
					<div className='flex items-center justify-between gap-2'>
						<StatusBadge status={post.status} />
						{post.isResolved && <StatusBadge status='RESOLVED' />}
					</div>
					{post.images[0] && (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={post.images[0].url}
							alt={post.title}
							className='mt-3 h-40 w-full rounded-md object-cover'
						/>
					)}
					<h3 className='mt-3 font-semibold'>{post.title}</h3>
					<p className='mt-1 text-xs text-muted-foreground'>
						{post.category.replace("_", " ")}
					</p>
				</Link>
			))}
		</div>
	);
}
