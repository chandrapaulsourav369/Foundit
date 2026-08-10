import { notFound } from "next/navigation";
import { getUserProfileAction, listUserListingsAction } from "@/lib/users/actions";
import UserAvatar from "@/components/UserAvatar";
import UserPostGrid from "@/components/posts/UserPostGrid";

export default async function ProfilePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const [profileResult, listingsResult] = await Promise.all([
		getUserProfileAction(id),
		listUserListingsAction(id),
	]);

	if (!profileResult.success || !profileResult.data) {
		notFound();
	}

	const { user } = profileResult.data;
	const posts = listingsResult.success && listingsResult.data
		? listingsResult.data.posts
		: [];

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
					{user.bio && (
						<p className='mt-1 text-sm text-muted-foreground'>{user.bio}</p>
					)}
					<p className='mt-2 text-xs text-muted-foreground'>
						{user.location && <>{user.location} &middot; </>}
						Joined{" "}
						{new Date(user.joinedAt).toLocaleDateString(undefined, {
							month: "long",
							year: "numeric",
						})}
					</p>
				</div>
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
			<UserPostGrid
				posts={posts}
				emptyDescription={`${user.name} hasn't posted anything yet.`}
			/>
		</main>
	);
}
