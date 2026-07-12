import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getMockUserPosts, mockUsers } from "@/lib/mock-data";
import UserAvatar from "@/components/UserAvatar";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { PackageSearch } from "lucide-react";

export default async function ProfilePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const user = mockUsers.find(u => u.id === id);
	if (!user) notFound();

	const session = await getSession();
	const isOwnProfile = session?.user?.id === user.id;
	const posts = getMockUserPosts(user.id);

	return (
		<main className='mx-auto max-w-4xl px-4 py-8'>
			<div className='flex flex-col items-center gap-4 rounded-lg border p-8 text-center sm:flex-row sm:text-left'>
				<UserAvatar
					name={user.name}
					avatarUrl={user.avatarUrl}
					className='size-24'
				/>
				<div className='flex-1'>
					<h1 className='text-2xl font-semibold'>{user.name}</h1>
					<p className='mt-1 text-sm text-muted-foreground'>{user.bio}</p>
					<p className='mt-2 text-xs text-muted-foreground'>
						{user.location} &middot; Joined{" "}
						{new Date(user.joinedAt).toLocaleDateString(undefined, {
							month: "long",
							year: "numeric",
						})}
					</p>
				</div>
				{!isOwnProfile && (
					<Button asChild>
						<Link href='/messages/conv1'>Message user</Link>
					</Button>
				)}
			</div>

			<div className='mt-6 grid grid-cols-3 gap-4'>
				<div className='rounded-lg border p-4 text-center'>
					<p className='text-2xl font-semibold'>{user.stats.posts}</p>
					<p className='text-xs text-muted-foreground'>Posts</p>
				</div>
				<div className='rounded-lg border p-4 text-center'>
					<p className='text-2xl font-semibold'>{user.stats.found}</p>
					<p className='text-xs text-muted-foreground'>Found items</p>
				</div>
				<div className='rounded-lg border p-4 text-center'>
					<p className='text-2xl font-semibold'>{user.stats.resolved}</p>
					<p className='text-xs text-muted-foreground'>Resolved</p>
				</div>
			</div>

			<h2 className='mt-8 mb-4 text-sm font-semibold'>Posts by {user.name}</h2>
			{posts.length === 0 ? (
				<EmptyState
					icon={PackageSearch}
					title='No posts yet'
					description={`${user.name} hasn't posted anything yet.`}
				/>
			) : (
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{posts.map(post => (
						<Link
							key={post.id}
							href={`/posts/${post.id}`}
							className='block rounded-lg border p-4 transition-colors hover:bg-accent'
						>
							<div className='flex items-center justify-between gap-2'>
								<StatusBadge status={post.status} />
								{post.isResolved && <StatusBadge status='RESOLVED' />}
							</div>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={post.imageUrl}
								alt={post.title}
								className='mt-3 h-40 w-full rounded-md object-cover'
							/>
							<h3 className='mt-3 font-semibold'>{post.title}</h3>
							<p className='mt-1 text-xs text-muted-foreground'>
								{post.category.replace("_", " ")}
							</p>
						</Link>
					))}
				</div>
			)}
		</main>
	);
}
