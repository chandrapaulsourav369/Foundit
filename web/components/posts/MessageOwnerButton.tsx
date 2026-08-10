"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createConversationAction } from "@/lib/messages/actions";

export default function MessageOwnerButton({ postId }: { postId: string }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleClick() {
		setLoading(true);
		const result = await createConversationAction(postId);
		setLoading(false);

		if (!result.success || !result.data) {
			toast.error(result.message || "Failed to start conversation");
			return;
		}

		router.push(`/messages/${result.data.conversation.id}`);
	}

	return (
		<Button size='sm' onClick={handleClick} disabled={loading}>
			Message owner
		</Button>
	);
}
