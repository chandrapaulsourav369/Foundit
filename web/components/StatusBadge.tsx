import { cn } from "@/lib/utils";

const VARIANTS = {
	LOST: "bg-destructive/10 text-destructive",
	FOUND: "bg-primary/10 text-primary",
	RESOLVED: "bg-secondary text-secondary-foreground",
	PENDING: "bg-muted text-muted-foreground",
	REVIEWING: "bg-accent/20 text-accent-foreground",
	REJECTED: "bg-destructive/10 text-destructive",
	ACTIVE: "bg-secondary text-secondary-foreground",
	BANNED: "bg-destructive/10 text-destructive",
} as const;

export type StatusBadgeVariant = keyof typeof VARIANTS;

export default function StatusBadge({
	status,
	className,
}: {
	status: StatusBadgeVariant;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
				VARIANTS[status],
				className,
			)}
		>
			{status}
		</span>
	);
}
