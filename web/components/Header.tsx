import Link from "next/link";
import { MapPinned } from "lucide-react";

import { signOut } from "@/lib/auth/auth";
import { getSession } from "@/lib/auth/session";
import { UserAvatarMenu } from "./UserAvatarMenu";

const NAV_LINKS = [
	{ href: "/", label: "Feed" },
	{ href: "/messages", label: "Messages" },
	{ href: "/notifications", label: "Notifications" },
	{ href: "/reports", label: "My Reports" },
];

const Header = async () => {
	const session = await getSession();
	const user = session?.user;

	return (
		<header className='fixed top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-md px-6 lg:px-20 py-4'>
			<div className='mx-auto flex max-w-7xl items-center justify-between'>
				<Link href='/' className='flex items-center' style={{ gap: "7px" }}>
					<MapPinned className='size-7 text-primary' />
					<h2 className='font-serif text-2xl font-bold tracking-tight text-foreground italic'>
						FoundIt
					</h2>
				</Link>
				<nav className='hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground'>
					{NAV_LINKS.map(link => (
						<Link
							key={link.href}
							href={link.href}
							className='transition-colors hover:text-foreground'
						>
							{link.label}
						</Link>
					))}
				</nav>
				<div className='flex items-center gap-4'>
					{user?.role === "ADMIN" && (
						<Link
							href='/admin'
							className='hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block'
						>
							Admin
						</Link>
					)}
					{user ? (
						<UserAvatarMenu user={user} signOutAction={signOut} />
					) : (
						<div className='flex items-center gap-3'>
							<Link
								href='/auth/signin'
								className='rounded-xl border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary/20'
							>
								Sign in
							</Link>
							<Link
								href='/auth/signup'
								className='rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(140,43,238,0.4)]'
							>
								Sign up
							</Link>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
