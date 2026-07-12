import Link from "next/link";
import { Button } from "@/components/ui/button";
import PostFeed from "@/components/posts/PostFeed";

export default function HomePage() {
	return (
		<main className='mx-auto max-w-6xl px-4 py-8'>
			<div className='mb-6 flex items-center justify-between'>
				<h1 className='text-2xl font-semibold'>Lost &amp; Found Feed</h1>
				<Button asChild>
					<Link href='/posts/create'>Create post</Link>
				</Button>
			</div>
			<PostFeed />
		</main>
	);
}
