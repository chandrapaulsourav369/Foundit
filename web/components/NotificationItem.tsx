import Link from "next/link";
import { AtSign, MessageCircle, Shield, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/timeAgo";
import { Notification } from "@/types/social";

const ICONS = {
	NEW_COMMENT: AtSign,
	NEW_MESSAGE: MessageCircle,
	REPORT_UPDATE: Flag,
	MODERATION: Shield,
} as const;

export default function NotificationItem({
	notification,
	onClick,
}: {
	notification: Notification;
	onClick?: () => void;
}) {
	const Icon = ICONS[notification.type];

	const content = (
		<>
			<span className='mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
				<Icon className='size-4' />
			</span>
			<div className='min-w-0 flex-1'>
				<p className='text-sm font-medium'>{notification.title}</p>
				<p className='mt-0.5 line-clamp-2 text-sm text-muted-foreground'>
					{notification.body}
				</p>
				<p className='mt-1 text-xs text-muted-foreground'>
					{timeAgo(notification.createdAt)}
				</p>
			</div>
			{!notification.isRead && (
				<span className='mt-1.5 size-2 shrink-0 rounded-full bg-primary' />
			)}
		</>
	);

	const className = cn(
		"flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent",
		!notification.isRead && "bg-primary/5",
	);

	if (notification.link) {
		return (
			<Link href={notification.link} onClick={onClick} className={className}>
				{content}
			</Link>
		);
	}

	return (
		<button type='button' onClick={onClick} className={className}>
			{content}
		</button>
	);
}
