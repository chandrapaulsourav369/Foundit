"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deletePostAction, resolvePostAction } from "@/lib/posts/actions";
import { Post } from "@/types/post";

export default function PostActions({ post }: { post: Post }) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const handleResolve = async () => {
		const result = await resolvePostAction(post.id, !post.isResolved);
		if (!result.success) {
			toast.error(result.message || "Failed to update post");
			return;
		}
		toast.success(
			post.isResolved ? "Marked as unresolved" : "Marked as resolved",
		);
		queryClient.invalidateQueries({ queryKey: ["posts"] });
		router.refresh();
	};

	const handleDelete = async () => {
		if (!window.confirm("Delete this post? This cannot be undone.")) return;

		const result = await deletePostAction(post.id);
		if (!result.success) {
			toast.error(result.message || "Failed to delete post");
			return;
		}
		toast.success("Post deleted");
		queryClient.invalidateQueries({ queryKey: ["posts"] });
		router.push("/");
	};

	return (
		<div className='flex gap-2'>
			<Button variant='outline' onClick={handleResolve}>
				{post.isResolved ? "Mark unresolved" : "Mark resolved"}
			</Button>
			<Button variant='outline' asChild>
				<Link href={`/posts/${post.id}/edit`}>Edit</Link>
			</Button>
			<Button variant='destructive' onClick={handleDelete}>
				Delete
			</Button>
		</div>
	);
}
