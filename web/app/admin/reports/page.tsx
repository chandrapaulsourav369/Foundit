import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import ReportsModeration from "./ReportsModeration";

export default async function AdminReportsPage() {
	const session = await getSession();
	if (session?.user.role !== "ADMIN") redirect("/");

	return (
		<main className='mx-auto max-w-6xl px-4 py-8'>
			<h1 className='text-2xl font-semibold'>Reports</h1>
			<p className='mt-1 text-sm text-muted-foreground'>
				Review reported content and take moderation action.
			</p>
			<div className='mt-6'>
				<ReportsModeration />
			</div>
		</main>
	);
}
