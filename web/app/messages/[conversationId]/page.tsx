"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/UserAvatar";
import MessageBubble from "@/components/MessageBubble";
import { useAuth } from "@/context/auth.context";
import {
	listConversationsAction,
	listMessagesAction,
	markConversationReadAction,
	sendMessageAction,
} from "@/lib/messages/actions";
import { getPostAction } from "@/lib/posts/actions";
import { Conversation, Message } from "@/types/social";

const POLL_INTERVAL_MS = 5000;

export default function ChatPage({
	params,
}: {
	params: Promise<{ conversationId: string }>;
}) {
	const { conversationId } = use(params);
	const { user } = useAuth();

	const [conversation, setConversation] = useState<Conversation | null>(null);
	const [postTitle, setPostTitle] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [draft, setDraft] = useState("");
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			const [convResult, messagesResult] = await Promise.all([
				listConversationsAction(),
				listMessagesAction(conversationId),
			]);

			if (cancelled) return;

			const conv = convResult.data?.conversations.find(
				c => c.id === conversationId,
			);
			if (!conv || !messagesResult.success || !messagesResult.data) {
				setNotFound(true);
				setLoading(false);
				return;
			}

			setConversation(conv);
			setMessages(messagesResult.data.messages);
			setLoading(false);
			void markConversationReadAction(conversationId);

			const postResult = await getPostAction(conv.postId);
			if (!cancelled && postResult.success && postResult.data) {
				setPostTitle(postResult.data.post.title);
			}
		}

		load();

		const interval = setInterval(async () => {
			const result = await listMessagesAction(conversationId);
			if (!cancelled && result.success && result.data) {
				setMessages(result.data.messages);
			}
		}, POLL_INTERVAL_MS);

		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, [conversationId]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ block: "end" });
	}, [messages]);

	async function handleSend(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = draft.trim();
		if (!trimmed) return;

		setDraft("");
		const result = await sendMessageAction(conversationId, trimmed);
		if (!result.success || !result.data) {
			toast.error(result.message || "Failed to send message");
			return;
		}
		setMessages(prev => [...prev, result.data!.message]);
	}

	if (loading) {
		return (
			<main className='mx-auto max-w-2xl px-4 py-8 text-sm text-muted-foreground'>
				Loading conversation...
			</main>
		);
	}

	if (notFound || !conversation) {
		return (
			<main className='mx-auto max-w-2xl px-4 py-8 text-sm text-muted-foreground'>
				Conversation not found.
			</main>
		);
	}

	return (
		<main className='mx-auto flex h-[calc(100vh-5rem)] max-w-2xl flex-col px-0 sm:px-4 sm:py-4'>
			<div className='flex items-center gap-3 border-b bg-background px-4 py-3 sm:rounded-t-lg sm:border'>
				<Link href='/messages' className='sm:hidden'>
					<ArrowLeft className='size-5' />
				</Link>
				<UserAvatar
					name={conversation.participant?.name ?? "Unknown"}
					avatarUrl={conversation.participant?.avatarUrl ?? null}
					className='size-9'
				/>
				<div>
					<p className='text-sm font-semibold'>
						{conversation.participant?.name ?? "Unknown"}
					</p>
					{postTitle && (
						<p className='text-xs text-muted-foreground'>Re: {postTitle}</p>
					)}
				</div>
			</div>

			<div className='flex-1 space-y-3 overflow-y-auto border-x px-4 py-4 sm:border'>
				{messages.map(message => (
					<MessageBubble
						key={message.id}
						message={message}
						isOwn={message.senderId === user?.id}
					/>
				))}
				<div ref={bottomRef} />
			</div>

			<form
				onSubmit={handleSend}
				className='flex items-center gap-2 border-t bg-background px-4 py-3 sm:rounded-b-lg sm:border'
			>
				<Input
					value={draft}
					onChange={e => setDraft(e.target.value)}
					placeholder='Type a message...'
					className='flex-1'
				/>
				<Button type='submit' size='icon' disabled={!draft.trim()}>
					<Send className='size-4' />
				</Button>
			</form>
		</main>
	);
}
