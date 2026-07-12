import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getPostAction } from "@/lib/posts/actions";
import PostActions from "@/components/posts/PostActions";
import PostComments from "@/components/posts/PostComments";
import ReportDialog from "@/components/ReportDialog";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { getMockUser, mockComments } from "@/lib/mock-data";

export default async function PostDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const [result, session] = await Promise.all([
		getPostAction(id),
		getSession(),
	]);

	if (!result.success || !result.data) {
		notFound();
	}

	const { post } = result.data;
	const canManage =
		session?.user &&
		(session.user.id === post.authorId || session.user.role === "ADMIN");
	const author = getMockUser(post.authorId);
	const isOwner = session?.user?.id === post.authorId;
	const postComments = mockComments.filter(c => c.postId === post.id);

	return (
		<main className='mx-auto max-w-2xl px-4 py-8'>
			<div className='mb-2 flex items-center gap-2'>
				<span className='rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'>
					{post.status}
				</span>
				{post.isResolved && (
					<span className='rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground'>
						RESOLVED
					</span>
				)}
			</div>

			<h1 className='text-2xl font-semibold'>{post.title}</h1>
			<p className='mt-1 text-sm text-muted-foreground'>
				{post.category.replace("_", " ")} &middot; {post.location}
			</p>

			{post.images.length > 0 && (
				<div className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3'>
					{post.images.map(image => (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							key={image.url}
							src={image.url}
							alt={post.title}
							className='h-32 w-full rounded-md object-cover'
						/>
					))}
				</div>
			)}

			<p className='mt-4 whitespace-pre-wrap text-sm'>{post.description}</p>

			<div className='mt-6 flex items-center justify-between gap-2 rounded-lg border p-4'>
				<Link
					href={`/profile/${author.id}`}
					className='flex items-center gap-3'
				>
					<UserAvatar
						name={author.name}
						avatarUrl={author.avatarUrl}
						className='size-11'
					/>
					<div>
						<p className='text-sm font-semibold'>{author.name}</p>
						<p className='text-xs text-muted-foreground'>{author.location}</p>
					</div>
				</Link>
				<div className='flex gap-2'>
					{!isOwner && (
						<Button asChild size='sm'>
							<Link href='/messages/conv1'>Message owner</Link>
						</Button>
					)}
					<ReportDialog targetLabel='this post' />
				</div>
			</div>

			{canManage && (
				<div className='mt-6'>
					<PostActions post={post} />
				</div>
			)}

			<div className='mt-8 border-t pt-6'>
				<PostComments postId={post.id} initialComments={postComments} />
			</div>
		</main>
	);
}
