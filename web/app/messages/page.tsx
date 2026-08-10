"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, MessagesSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/UserAvatar";
import EmptyState from "@/components/EmptyState";
import { listConversationsAction } from "@/lib/messages/actions";
import { Conversation } from "@/types/social";

function timeAgo(iso: string) {
	const diffMs = Date.now() - new Date(iso).getTime();
	const minutes = Math.max(1, Math.round(diffMs / 60000));
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours}h`;
	return `${Math.round(hours / 24)}d`;
}

export default function MessagesInboxPage() {
	const [search, setSearch] = useState("");
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		listConversationsAction().then(result => {
			if (result.success && result.data) {
				setConversations(result.data.conversations);
			}
			setLoading(false);
		});
	}, []);

	const visible = conversations.filter(c =>
		(c.participant?.name ?? "").toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<main className='mx-auto max-w-2xl px-4 py-8'>
			<h1 className='text-2xl font-semibold'>Messages</h1>

			<div className='relative mt-4'>
				<Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
				<Input
					value={search}
					onChange={e => setSearch(e.target.value)}
					placeholder='Search conversations...'
					className='pl-9'
				/>
			</div>

			<div className='mt-4 divide-y rounded-lg border'>
				{visible.map(conv => (
					<Link
						key={conv.id}
						href={`/messages/${conv.id}`}
						className='flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent'
					>
						<UserAvatar
							name={conv.participant?.name ?? "Unknown"}
							avatarUrl={conv.participant?.avatarUrl ?? null}
							className='size-11 shrink-0'
						/>
						<div className='min-w-0 flex-1'>
							<div className='flex items-center justify-between gap-2'>
								<p className='truncate text-sm font-semibold'>
									{conv.participant?.name ?? "Unknown"}
								</p>
								<span className='shrink-0 text-xs text-muted-foreground'>
									{timeAgo(conv.lastMessageAt)}
								</span>
							</div>
							<p className='truncate text-sm text-muted-foreground'>
								{conv.lastMessage ?? "No messages yet"}
							</p>
						</div>
						{conv.unreadCount > 0 && (
							<span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground'>
								{conv.unreadCount}
							</span>
						)}
					</Link>
				))}
			</div>

			{!loading && visible.length === 0 && (
				<EmptyState
					icon={MessagesSquare}
					title='No conversations found'
					description='Try a different search term.'
				/>
			)}
		</main>
	);
}
