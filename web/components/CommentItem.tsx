import { Trash2 } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/timeAgo";
import { Comment } from "@/types/social";

export default function CommentItem({
	comment,
	canDelete = false,
	onDelete,
}: {
	comment: Comment;
	canDelete?: boolean;
	onDelete?: () => void;
}) {
	const authorName = comment.author?.name ?? "Deleted user";

	return (
		<div className='flex gap-3'>
			<UserAvatar
				name={authorName}
				avatarUrl={comment.author?.avatarUrl ?? null}
				className='size-9 shrink-0'
			/>
			<div className='flex-1 rounded-lg bg-muted/50 px-3 py-2'>
				<div className='flex items-center justify-between gap-2'>
					<span className='text-sm font-semibold'>{authorName}</span>
					<div className='flex items-center gap-2'>
						<span className='text-xs text-muted-foreground'>
							{timeAgo(comment.createdAt)}
						</span>
						{canDelete && (
							<Button
								variant='ghost'
								size='icon-sm'
								onClick={onDelete}
								aria-label='Delete comment'
							>
								<Trash2 className='size-3.5' />
							</Button>
						)}
					</div>
				</div>
				<p className='mt-1 text-sm text-foreground/90'>{comment.body}</p>
			</div>
		</div>
	);
}
