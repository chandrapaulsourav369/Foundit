"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import LikeButton from "@/components/posts/LikeButton";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/timeAgo";
import { Post } from "@/types/post";

export default function PostCard({ post }: { post: Post }) {
	const authorName = post.author?.name ?? "Unknown";

	return (
		<article className='rounded-lg bg-card shadow-sm'>
			<div className='flex items-center justify-between gap-2 p-4'>
				<Link
					href={`/posts/${post.id}`}
					className='flex min-w-0 items-center gap-3'
				>
					<UserAvatar name={authorName} avatarUrl={post.author?.avatarUrl} />
					<div className='min-w-0'>
						<p className='truncate text-sm font-semibold'>{authorName}</p>
						<p className='text-xs text-muted-foreground'>
							{timeAgo(post.createdAt)}
						</p>
					</div>
				</Link>
				<div className='flex shrink-0 items-center gap-2'>
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
			</div>

			<Link href={`/posts/${post.id}`} className='block'>
				<h3 className='px-4 font-semibold'>{post.title}</h3>
				<p className='mt-1 line-clamp-3 px-4 text-sm text-muted-foreground'>
					{post.description}
				</p>

				{post.images[0] && (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={post.images[0].url}
						alt={post.title}
						className='mt-3 h-80 w-full object-cover'
					/>
				)}

				<div className='flex items-center justify-between px-4 pt-3 text-xs text-muted-foreground'>
					<span>{post.category.replace("_", " ")}</span>
					<span>{post.location}</span>
				</div>
			</Link>

			<div className='mt-2 flex items-center gap-1 px-2 py-1'>
				<LikeButton
					postId={post.id}
					likedByMe={post.likedByMe}
					likeCount={post.likeCount}
				/>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					className='gap-1.5 text-muted-foreground'
					asChild
				>
					<Link href={`/posts/${post.id}`}>
						<MessageCircle className='size-4' />
						{post.commentCount > 0 ? post.commentCount : "Comment"}
					</Link>
				</Button>
			</div>
		</article>
	);
}
