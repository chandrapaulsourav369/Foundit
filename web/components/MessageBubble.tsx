import { cn } from "@/lib/utils";
import { Message } from "@/types/social";

export default function MessageBubble({
	message,
	isOwn,
}: {
	message: Message;
	isOwn: boolean;
}) {
	return (
		<div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
			<div
				className={cn(
					"max-w-[75%] rounded-2xl px-4 py-2 text-sm",
					isOwn
						? "rounded-br-sm bg-primary text-primary-foreground"
						: "rounded-bl-sm bg-muted text-foreground",
				)}
			>
				<p className='whitespace-pre-wrap'>{message.body}</p>
				<p
					className={cn(
						"mt-1 text-[10px] opacity-70",
						isOwn ? "text-right" : "text-left",
					)}
				>
					{new Date(message.createdAt).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</p>
			</div>
		</div>
	);
}
