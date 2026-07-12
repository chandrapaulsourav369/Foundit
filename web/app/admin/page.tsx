import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Users, FileText, Flag } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import StatusBadge from "@/components/StatusBadge";
import {
	mockAdminPosts,
	mockAdminStats,
	mockAdminUsers,
	mockReports,
} from "@/lib/mock-data";

export default async function AdminDashboardPage() {
	const session = await getSession();
	if (session?.user.role !== "ADMIN") redirect("/");

	return (
		<main className='mx-auto max-w-6xl px-4 py-8'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-semibold'>Admin Dashboard</h1>
				<div className='flex gap-2'>
					<Button asChild variant='outline' size='sm'>
						<Link href='/admin/reports'>Review reports</Link>
					</Button>
					<Button asChild variant='outline' size='sm'>
						<Link href='/admin/users'>Manage users</Link>
					</Button>
					<Button asChild size='sm'>
						<Link href='/admin/posts'>Manage posts</Link>
					</Button>
				</div>
			</div>

			<div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{mockAdminStats.map(stat => (
					<div key={stat.label} className='rounded-lg border p-5'>
						<p className='text-sm text-muted-foreground'>{stat.label}</p>
						<p className='mt-2 text-3xl font-semibold'>{stat.value}</p>
						<p
							className={`mt-1 flex items-center gap-1 text-xs font-medium ${
								stat.trend === "up" ? "text-secondary-foreground" : "text-destructive"
							}`}
						>
							{stat.trend === "up" ? (
								<ArrowUpRight className='size-3.5' />
							) : (
								<ArrowDownRight className='size-3.5' />
							)}
							{stat.change} this month
						</p>
					</div>
				))}
			</div>

			<div className='mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3'>
				<div className='rounded-lg border p-5'>
					<h2 className='flex items-center gap-2 text-sm font-semibold'>
						<Flag className='size-4' /> Recent reports
					</h2>
					<div className='mt-3 space-y-3'>
						{mockReports.slice(0, 3).map(report => (
							<div key={report.id} className='flex items-center justify-between gap-2 text-sm'>
								<span className='truncate'>{report.post.title}</span>
								<StatusBadge status={report.status} />
							</div>
						))}
					</div>
				</div>

				<div className='rounded-lg border p-5'>
					<h2 className='flex items-center gap-2 text-sm font-semibold'>
						<Users className='size-4' /> Recent users
					</h2>
					<div className='mt-3 space-y-3'>
						{mockAdminUsers.slice(0, 3).map(user => (
							<div key={user.id} className='flex items-center gap-3 text-sm'>
								<UserAvatar
									name={user.name}
									avatarUrl={user.avatarUrl}
									className='size-8'
								/>
								<span className='truncate'>{user.name}</span>
							</div>
						))}
					</div>
				</div>

				<div className='rounded-lg border p-5'>
					<h2 className='flex items-center gap-2 text-sm font-semibold'>
						<FileText className='size-4' /> Recent posts
					</h2>
					<div className='mt-3 space-y-3'>
						{mockAdminPosts.slice(0, 3).map(post => (
							<div key={post.id} className='flex items-center justify-between gap-2 text-sm'>
								<span className='truncate'>{post.title}</span>
								<StatusBadge status={post.status} />
							</div>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}
