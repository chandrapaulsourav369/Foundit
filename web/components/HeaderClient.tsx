"use client";

import Link from "next/link";
import { MapPinned } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { UserAvatarMenu } from "./UserAvatarMenu";
import { ThemeToggle } from "./theme/toggle-theme";
import type { Session } from "@/types/auth";

const NAV_LINKS = [
	{ href: "/feed", label: "Feed" },
	{ href: "/messages", label: "Messages" },
	{ href: "/notifications", label: "Notifications" },
];

type HeaderClientProps = {
	user: Session["user"] | null;
	unreadCount: number;
	signOutAction: () => Promise<void>;
};

export function HeaderClient({ user, unreadCount, signOutAction }: HeaderClientProps) {
	const pathname = usePathname();
	const isLanding = pathname === "/";
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		if (!isLanding) return;
		const onScroll = () => setScrolled(window.scrollY > 80);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [isLanding]);

	const transparent = isLanding && !scrolled;

	return (
		<header
			className={cn(
				"fixed top-0 z-50 w-full px-6 py-4 transition-colors duration-300 lg:px-20",
				transparent
					? "border-b border-transparent bg-transparent"
					: "border-b border-primary/10 bg-background/80 backdrop-blur-md"
			)}
		>
			<div className='mx-auto flex max-w-7xl items-center justify-between'>
				<Link href='/' className='flex items-center' style={{ gap: "7px" }}>
					<MapPinned className='size-7 text-primary' />
					<h2
						className={cn(
							"font-serif text-2xl font-bold tracking-tight italic",
							transparent ? "text-white" : "text-foreground"
						)}
					>
						FoundIt
					</h2>
				</Link>
				<nav
					className={cn(
						"hidden md:flex items-center gap-8 text-sm font-medium",
						transparent ? "text-white/80" : "text-muted-foreground"
					)}
				>
					{NAV_LINKS.map(link => (
						<Link
							key={link.href}
							href={link.href}
							className={cn(
								"relative transition-colors",
								transparent ? "hover:text-white" : "hover:text-foreground"
							)}
						>
							{link.label}
							{link.href === "/notifications" && unreadCount > 0 && (
								<span className='ml-1.5 rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground'>
									{unreadCount}
								</span>
							)}
						</Link>
					))}
				</nav>
				<div className='flex items-center gap-4'>
					{user?.role === "ADMIN" && (
						<Link
							href='/admin'
							className={cn(
								"hidden text-sm font-medium transition-colors md:block",
								transparent
									? "text-white/80 hover:text-white"
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							Admin
						</Link>
					)}
					<ThemeToggle />
					{user ? (
						<UserAvatarMenu user={user} signOutAction={signOutAction} />
					) : (
						<div className='flex items-center gap-3'>
							<Link
								href='/auth/signin'
								className={cn(
									"rounded-xl border px-5 py-2.5 text-sm font-bold transition-all",
									transparent
										? "border-white/40 bg-white/10 text-white hover:bg-white/20"
										: "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
								)}
							>
								Sign in
							</Link>
							<Link
								href='/auth/signup'
								className='rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(140,43,238,0.4)]'
							>
								Sign up
							</Link>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
