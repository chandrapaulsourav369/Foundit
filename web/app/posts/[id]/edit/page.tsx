import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getPostAction } from "@/lib/posts/actions";
import PostForm from "@/components/posts/PostForm";

export default async function EditPostPage({
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
	const canEdit =
		session?.user &&
		(session.user.id === post.authorId || session.user.role === "ADMIN");

	if (!canEdit) {
		redirect(`/posts/${id}`);
	}

	return (
		<main className='mx-auto max-w-2xl px-4 py-8'>
			<h1 className='mb-6 text-2xl font-semibold'>Edit post</h1>
			<PostForm post={post} />
		</main>
	);
}
