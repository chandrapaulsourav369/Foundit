"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Bell, PlusCircle, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
	{ href: "/", label: "Home", icon: Home },
	{ href: "/messages", label: "Messages", icon: MessageCircle },
	{ href: "/posts/create", label: "Post", icon: PlusCircle },
	{ href: "/notifications", label: "Alerts", icon: Bell },
	{ href: "/reports", label: "Reports", icon: FileWarning },
];

export default function MobileBottomNav() {
	const pathname = usePathname();

	return (
		<nav className='fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t bg-background/95 py-2 backdrop-blur-md md:hidden'>
			{ITEMS.map(item => {
				const active =
					item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
				const Icon = item.icon;
				return (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"flex flex-col items-center gap-0.5 px-2 py-1 text-[11px]",
							active ? "text-primary" : "text-muted-foreground",
						)}
					>
						<Icon className='size-5' />
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}
