import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import UsersTable from "./UsersTable";

export default async function AdminUsersPage() {
	const session = await getSession();
	if (session?.user.role !== "ADMIN") redirect("/");

	return (
		<main className='mx-auto max-w-6xl px-4 py-8'>
			<h1 className='text-2xl font-semibold'>Users</h1>
			<p className='mt-1 text-sm text-muted-foreground'>
				{"Manage registered users, roles, and account status."}
			</p>
			<div className='mt-6'>
				<UsersTable />
			</div>
		</main>
	);
}
