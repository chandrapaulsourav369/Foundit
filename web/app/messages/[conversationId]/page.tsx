"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/UserAvatar";
import MessageBubble from "@/components/MessageBubble";
import { currentMockUser, getMockConversation } from "@/lib/mock-data";
import { Message } from "@/types/social";

export default function ChatPage({
	params,
}: {
	params: Promise<{ conversationId: string }>;
}) {
	const { conversationId } = use(params);
	const conversation = getMockConversation(conversationId);
	if (!conversation) notFound();
	const participant = conversation.participant;

	const [messages, setMessages] = useState<Message[]>(conversation.messages);
	const [draft, setDraft] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ block: "end" });
	}, [messages, isTyping]);

	function handleSend(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = draft.trim();
		if (!trimmed) return;

		setMessages(prev => [
			...prev,
			{
				id: `local-${Date.now()}`,
				conversationId,
				senderId: currentMockUser.id,
				body: trimmed,
				createdAt: new Date().toISOString(),
			},
		]);
		setDraft("");

		setIsTyping(true);
		setTimeout(() => {
			setIsTyping(false);
			setMessages(prev => [
				...prev,
				{
					id: `local-reply-${Date.now()}`,
					conversationId,
					senderId: participant.id,
					body: "Got it, thanks!",
					createdAt: new Date().toISOString(),
				},
			]);
		}, 1600);
	}

	return (
		<main className='mx-auto flex h-[calc(100vh-5rem)] max-w-2xl flex-col px-0 sm:px-4 sm:py-4'>
			<div className='flex items-center gap-3 border-b bg-background px-4 py-3 sm:rounded-t-lg sm:border'>
				<Link href='/messages' className='sm:hidden'>
					<ArrowLeft className='size-5' />
				</Link>
				<UserAvatar
					name={conversation.participant.name}
					avatarUrl={conversation.participant.avatarUrl}
					className='size-9'
				/>
				<div>
					<p className='text-sm font-semibold'>{conversation.participant.name}</p>
					<p className='text-xs text-muted-foreground'>
						Re: {conversation.postTitle}
					</p>
				</div>
			</div>

			<div className='flex-1 space-y-3 overflow-y-auto border-x px-4 py-4 sm:border'>
				{messages.map(message => (
					<MessageBubble
						key={message.id}
						message={message}
						isOwn={message.senderId === currentMockUser.id}
					/>
				))}
				{isTyping && (
					<div className='flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3 w-fit'>
						<span className='size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]' />
						<span className='size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]' />
						<span className='size-1.5 animate-bounce rounded-full bg-muted-foreground' />
					</div>
				)}
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
