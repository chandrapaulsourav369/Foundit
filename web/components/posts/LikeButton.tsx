"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth.context";
import { toggleLikeAction } from "@/lib/likes/actions";
import { cn } from "@/lib/utils";

export default function LikeButton({
	postId,
	likedByMe,
	likeCount,
}: {
	postId: string;
	likedByMe: boolean;
	likeCount: number;
}) {
	const { user } = useAuth();
	const [liked, setLiked] = useState(likedByMe);
	const [count, setCount] = useState(likeCount);
	const [pending, setPending] = useState(false);

	async function handleClick() {
		if (!user) {
			toast.error("Sign in to like posts");
			return;
		}
		if (pending) return;

		const nextLiked = !liked;
		setLiked(nextLiked);
		setCount(c => c + (nextLiked ? 1 : -1));
		setPending(true);

		const result = await toggleLikeAction(postId);
		setPending(false);

		if (!result.success || !result.data) {
			setLiked(!nextLiked);
			setCount(c => c + (nextLiked ? -1 : 1));
			toast.error(result.message || "Failed to update like");
			return;
		}

		setLiked(result.data.liked);
		setCount(result.data.likeCount);
	}

	return (
		<Button
			type='button'
			variant='ghost'
			size='sm'
			onClick={handleClick}
			className={cn(
				"gap-1.5 text-muted-foreground",
				liked && "text-destructive",
			)}
		>
			<Heart className={cn("size-4", liked && "fill-current")} />
			{count > 0 ? count : "Like"}
		</Button>
	);
}
