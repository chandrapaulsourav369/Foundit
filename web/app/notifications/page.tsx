"use client";

import { useState } from "react";
import { BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationItem from "@/components/NotificationItem";
import EmptyState from "@/components/EmptyState";
import { mockNotifications } from "@/lib/mock-data";
import { Notification } from "@/types/social";

export default function NotificationsPage() {
	const [notifications, setNotifications] =
		useState<Notification[]>(mockNotifications);
	const [filter, setFilter] = useState<"all" | "unread">("all");

	const visible = notifications.filter(n =>
		filter === "unread" ? !n.read : true,
	);

	function markAllRead() {
		setNotifications(prev => prev.map(n => ({ ...n, read: true })));
	}

	function markRead(id: string) {
		setNotifications(prev =>
			prev.map(n => (n.id === id ? { ...n, read: true } : n)),
		);
	}

	return (
		<main className='mx-auto max-w-2xl px-4 py-8'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-semibold'>Notifications</h1>
				<Button variant='outline' size='sm' onClick={markAllRead}>
					Mark all as read
				</Button>
			</div>

			<Tabs
				value={filter}
				onValueChange={v => setFilter(v as "all" | "unread")}
				className='mt-4'
			>
				<TabsList>
					<TabsTrigger value='all'>All</TabsTrigger>
					<TabsTrigger value='unread'>
						Unread
						{notifications.some(n => !n.read) && (
							<span className='ml-1.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground'>
								{notifications.filter(n => !n.read).length}
							</span>
						)}
					</TabsTrigger>
				</TabsList>
			</Tabs>

			<div className='mt-4 space-y-2'>
				{visible.map(notification => (
					<NotificationItem
						key={notification.id}
						notification={notification}
						onClick={() => markRead(notification.id)}
					/>
				))}
			</div>

			{visible.length === 0 && (
				<EmptyState icon={BellOff} title="You're all caught up" />
			)}
		</main>
	);
}
