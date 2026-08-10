import type { Metadata } from "next";
import "./globals.css";

import Header from "./../components/Header";
import Footer from "./../components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import MainProvider from "@/providers/Provider";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
	title: "FoundIt — Lost & Found",
	description: "Report and recover lost items on campus.",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();

	return (
		<html lang='en' suppressHydrationWarning>
			<body
			// className={
			// 	inter.className +
			// 	"overflow-x-hidden min-h-screen"
			// }
			>
				<MainProvider initialUser={session?.user ?? null}>
					<Header />
					<main className='pt-20 min-h-screen'>{children}</main>
					<Footer />
					<MobileBottomNav />
				</MainProvider>
			</body>
		</html>
	);
}
