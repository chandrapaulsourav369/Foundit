import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, FileText, Flag, CheckCircle2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import StatusBadge from "@/components/StatusBadge";
import {
	adminListPostsAction,
	adminListReportsAction,
	adminListUsersAction,
	adminStatsAction,
} from "@/lib/admin/actions";
import { getPostAction } from "@/lib/posts/actions";

export default async function AdminDashboardPage() {
	const session = await getSession();
	if (session?.user.role !== "ADMIN") redirect("/");

	const [postsResult, usersResult, reportsResult, statsResult] = await Promise.all([
		adminListPostsAction(),
		adminListUsersAction(),
		adminListReportsAction(),
		adminStatsAction(),
	]);

	const stats = statsResult.data?.stats;
	const statCards = [
		{ label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users },
		{ label: "Total Posts", value: stats?.totalPosts ?? 0, icon: FileText },
		{ label: "Resolved", value: stats?.resolvedPosts ?? 0, icon: CheckCircle2 },
		{ label: "Open Reports", value: stats?.openReports ?? 0, icon: Flag },
	];

	const recentPosts = (postsResult.data?.posts ?? []).slice(0, 3);
	const recentUsers = (usersResult.data?.users ?? []).slice(0, 3);
	const recentReports = (reportsResult.data?.reports ?? []).slice(0, 3);

	const recentReportPosts = await Promise.all(
		recentReports.map(r => getPostAction(r.postId)),
	);

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
				{statCards.map(stat => (
					<div key={stat.label} className='rounded-lg border p-5'>
						<p className='flex items-center gap-1.5 text-sm text-muted-foreground'>
							<stat.icon className='size-3.5' /> {stat.label}
						</p>
						<p className='mt-2 text-3xl font-semibold'>{stat.value}</p>
					</div>
				))}
			</div>

			<div className='mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3'>
				<div className='rounded-lg border p-5'>
					<h2 className='flex items-center gap-2 text-sm font-semibold'>
						<Flag className='size-4' /> Recent reports
					</h2>
					<div className='mt-3 space-y-3'>
						{recentReports.map((report, i) => {
							const post = recentReportPosts[i];
							return (
								<div key={report.id} className='flex items-center justify-between gap-2 text-sm'>
									<span className='truncate'>
										{post?.success && post.data ? post.data.post.title : "Listing"}
									</span>
									<StatusBadge status={report.status} />
								</div>
							);
						})}
					</div>
				</div>

				<div className='rounded-lg border p-5'>
					<h2 className='flex items-center gap-2 text-sm font-semibold'>
						<Users className='size-4' /> Recent users
					</h2>
					<div className='mt-3 space-y-3'>
						{recentUsers.map(user => (
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
						{recentPosts.map(post => (
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
