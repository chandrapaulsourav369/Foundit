import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import PostsTable from "./PostsTable";

export default async function AdminPostsPage() {
	const session = await getSession();
	if (session?.user.role !== "ADMIN") redirect("/");

	return (
		<main className='mx-auto max-w-6xl px-4 py-8'>
			<h1 className='text-2xl font-semibold'>Posts</h1>
			<p className='mt-1 text-sm text-muted-foreground'>
				{"Moderate lost & found listings across the platform."}
			</p>
			<div className='mt-6'>
				<PostsTable />
			</div>
		</main>
	);
}
