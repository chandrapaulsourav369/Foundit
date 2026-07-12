import { AtSign, MessageCircle, Shield, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification } from "@/types/social";

const ICONS = {
	comment: AtSign,
	message: MessageCircle,
	report: Flag,
	admin: Shield,
} as const;

function timeAgo(iso: string) {
	const diffMs = Date.now() - new Date(iso).getTime();
	const minutes = Math.max(1, Math.round(diffMs / 60000));
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.round(hours / 24)}d ago`;
}

export default function NotificationItem({
	notification,
	onClick,
}: {
	notification: Notification;
	onClick?: () => void;
}) {
	const Icon = ICONS[notification.type];

	return (
		<button
			type='button'
			onClick={onClick}
			className={cn(
				"flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent",
				!notification.read && "bg-primary/5",
			)}
		>
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
			{!notification.read && (
				<span className='mt-1.5 size-2 shrink-0 rounded-full bg-primary' />
			)}
		</button>
	);
}
