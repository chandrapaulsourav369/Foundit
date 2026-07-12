import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import PostForm from "@/components/posts/PostForm";

export default async function CreatePostPage() {
	const session = await getSession();
	if (!session?.user) {
		redirect("/auth/signin");
	}

	return (
		<main className='mx-auto max-w-2xl px-4 py-8'>
			<h1 className='mb-6 text-2xl font-semibold'>
				Report a lost or found item
			</h1>
			<PostForm />
		</main>
	);
}
