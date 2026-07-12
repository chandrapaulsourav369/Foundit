"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CommentItem from "@/components/CommentItem";
import { currentMockUser } from "@/lib/mock-data";
import { Comment } from "@/types/social";

export default function PostComments({
	postId,
	initialComments,
}: {
	postId: string;
	initialComments: Comment[];
}) {
	const [comments, setComments] = useState(initialComments);
	const [body, setBody] = useState("");

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = body.trim();
		if (!trimmed) return;

		setComments(prev => [
			...prev,
			{
				id: `local-${Date.now()}`,
				postId,
				author: currentMockUser,
				body: trimmed,
				createdAt: new Date().toISOString(),
			},
		]);
		setBody("");
	}

	return (
		<div className='space-y-4'>
			<h2 className='text-sm font-semibold'>
				Comments ({comments.length})
			</h2>

			<form onSubmit={handleSubmit} className='flex gap-3'>
				<Textarea
					value={body}
					onChange={e => setBody(e.target.value)}
					placeholder='Add a comment...'
					rows={2}
					className='flex-1'
				/>
				<Button type='submit' className='self-end'>
					Post
				</Button>
			</form>

			<div className='space-y-3'>
				{comments.map(comment => (
					<CommentItem key={comment.id} comment={comment} />
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
