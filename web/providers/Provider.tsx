import GSAPProvider from "./gsapProvider";
import { ThemeProvider } from "./theme-provider";
import UploaderLayout from "./UploadThing-provider";
import QueryProvider from "./query-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/auth.context";
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
							defaultTheme='system'
							enableSystem
							disableTransitionOnChange
						>
							<GSAPProvider />
							<Toaster richColors position='top-right' />
							{children}
						</ThemeProvider>
					</UploaderLayout>
				</QueryProvider>
			</AuthProvider>
		</>
	);
}
