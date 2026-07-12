import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map(part => part[0]?.toUpperCase() ?? "")
		.join("");
}

export default function UserAvatar({
	name,
	avatarUrl,
	className,
}: {
	name: string;
	avatarUrl?: string | null;
	className?: string;
}) {
	return (
		<Avatar className={cn(className)}>
			{avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
			<AvatarFallback>{getInitials(name)}</AvatarFallback>
		</Avatar>
	);
}
