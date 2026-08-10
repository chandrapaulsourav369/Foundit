import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
	return (
		<section className='relative mx-auto my-8 max-w-6xl overflow-hidden rounded-3xl px-4 py-20 text-center sm:py-28'>
			<Image
				src='https://images.unsplash.com/photo-1744843799161-221896eb7e73?w=1600&q=80&auto=format&fit=crop'
				alt=''
				fill
				sizes='(min-width: 1280px) 1152px, 100vw'
				className='object-cover'
			/>
			<div className='absolute inset-0 bg-linear-to-t from-black/85 via-black/60 to-black/40' />
			<div className='absolute inset-0 bg-[linear-gradient(120deg,var(--color-primary)/60%,transparent_55%)] mix-blend-multiply' />
			<div className='relative flex flex-col items-center gap-6'>
				<h2 className='max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl'>
					Ready to get it back?
				</h2>
				<p className='max-w-md text-white/80'>
					Post it, search it, message about it — every step happens right here on
					FoundIt.
				</p>
				<div className='flex flex-wrap items-center justify-center gap-4'>
					<Button asChild size='lg'>
						<Link href='/posts/create'>Report an item</Link>
					</Button>
					<Button
						asChild
						size='lg'
						variant='outline'
						className='border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white'
					>
						<Link href='/feed'>Browse the feed</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
