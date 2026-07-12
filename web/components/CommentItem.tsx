import UserAvatar from "@/components/UserAvatar";
import { Comment } from "@/types/social";

function timeAgo(iso: string) {
	const diffMs = Date.now() - new Date(iso).getTime();
	const minutes = Math.max(1, Math.round(diffMs / 60000));
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.round(hours / 24)}d ago`;
}

export default function CommentItem({ comment }: { comment: Comment }) {
	return (
		<div className='flex gap-3'>
			<UserAvatar
				name={comment.author.name}
				avatarUrl={comment.author.avatarUrl}
				className='size-9 shrink-0'
			/>
			<div className='flex-1 rounded-lg bg-muted/50 px-3 py-2'>
				<div className='flex items-center justify-between gap-2'>
					<span className='text-sm font-semibold'>{comment.author.name}</span>
					<span className='text-xs text-muted-foreground'>
						{timeAgo(comment.createdAt)}
					</span>
				</div>
				<p className='mt-1 text-sm text-foreground/90'>{comment.body}</p>
			</div>
		</div>
	);
}
