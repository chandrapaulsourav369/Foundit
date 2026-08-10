"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CommentItem from "@/components/CommentItem";
import { useAuth } from "@/context/auth.context";
import {
	createCommentAction,
	deleteCommentAction,
	listCommentsAction,
} from "@/lib/comments/actions";
import { Comment } from "@/types/social";

export default function PostComments({
	postId,
	initialComments,
}: {
	postId: string;
	initialComments: Comment[];
}) {
	const { user } = useAuth();
	const [comments, setComments] = useState(initialComments);
	const [body, setBody] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		let cancelled = false;
		listCommentsAction(postId).then(result => {
			if (!cancelled && result.success && result.data) {
				setComments(result.data.comments);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [postId]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = body.trim();
		if (!trimmed) return;

		setSubmitting(true);
		const result = await createCommentAction(postId, trimmed);
		setSubmitting(false);

		if (!result.success || !result.data) {
			toast.error(result.message || "Failed to post comment");
			return;
		}

		setComments(prev => [...prev, result.data!.comment]);
		setBody("");
	}

	async function handleDelete(commentId: string) {
		const result = await deleteCommentAction(postId, commentId);
		if (!result.success) {
			toast.error(result.message || "Failed to delete comment");
			return;
		}
		setComments(prev => prev.filter(c => c.id !== commentId));
	}

	return (
		<div className='space-y-4'>
			<h2 className='text-sm font-semibold'>Comments ({comments.length})</h2>

			{user ? (
				<form onSubmit={handleSubmit} className='flex gap-3'>
					<Textarea
						value={body}
						onChange={e => setBody(e.target.value)}
						placeholder='Add a comment...'
						rows={2}
						className='flex-1'
					/>
					<Button type='submit' className='self-end' disabled={submitting}>
						Post
					</Button>
				</form>
			) : (
				<p className='text-sm text-muted-foreground'>
					Sign in to leave a comment.
				</p>
			)}

			<div className='space-y-3'>
				{comments.map(comment => (
					<CommentItem
						key={comment.id}
						comment={comment}
						canDelete={
							Boolean(user) &&
							(user?.id === comment.authorId || user?.role === "ADMIN")
						}
						onDelete={() => handleDelete(comment.id)}
					/>
				))}
				{comments.length === 0 && (
					<p className='text-sm text-muted-foreground'>
						No comments yet. Be the first to comment.
					</p>
				)}
			</div>
		</div>
	);
}
