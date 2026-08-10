import { Suspense } from "react";
import GSAPProvider from "./gsapProvider";
import { ThemeProvider } from "./theme-provider";
import UploaderLayout from "./UploadThing-provider";
import QueryProvider from "./query-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/auth.context";
import { AuthRequiredToast } from "@/components/AuthRequiredToast";
import { Session } from "@/types/auth";

export default function MainProvider({
	children,
	initialUser,
}: {
	children: React.ReactNode;
	initialUser?: Session["user"] | null;
}) {
	return (
		<>
			<AuthProvider initialUser={initialUser}>
				<QueryProvider>
					<UploaderLayout>
						<ThemeProvider
							attribute='class'
							defaultTheme='light'
							enableSystem={false}
							disableTransitionOnChange
						>
							<GSAPProvider />
							<Toaster richColors position='top-right' />
							<Suspense fallback={null}>
								<AuthRequiredToast />
							</Suspense>
							{children}
						</ThemeProvider>
					</UploaderLayout>
				</QueryProvider>
			</AuthProvider>
		</>
	);
}
