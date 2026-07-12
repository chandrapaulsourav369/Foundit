import Link from "next/link";
import { Post } from "@/types/post";

export default function PostCard({ post }: { post: Post }) {
	return (
		<Link
			href={`/posts/${post.id}`}
			className='block rounded-lg border p-4 transition-colors hover:bg-accent'
		>
			<div className='flex items-center justify-between gap-2'>
				<span
					className={`rounded-full px-2 py-0.5 text-xs font-medium ${
						post.status === "LOST"
							? "bg-destructive/10 text-destructive"
							: "bg-primary/10 text-primary"
					}`}
				>
					{post.status}
				</span>
				{post.isResolved && (
					<span className='rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground'>
						RESOLVED
					</span>
				)}
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
			<p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
				{post.description}
			</p>
			<div className='mt-2 flex items-center justify-between text-xs text-muted-foreground'>
				<span>{post.category.replace("_", " ")}</span>
				<span>{post.location}</span>
			</div>
		</Link>
	);
}
