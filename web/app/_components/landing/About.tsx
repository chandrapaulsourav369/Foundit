"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

export function About() {
	const rootRef = useRef<HTMLElement>(null);

	useGSAP(
		() => {
			const reduced = prefersReducedMotion();

			gsap.from(".about-graphic", {
				opacity: 0,
				x: -60,
				duration: reduced ? 0 : 0.8,
				scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
			});

			gsap.from(".about-text > *", {
				opacity: 0,
				y: 24,
				duration: reduced ? 0 : 0.6,
				stagger: reduced ? 0 : 0.15,
				delay: reduced ? 0 : 0.15,
				scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
			});
		},
		{ scope: rootRef }
	);

	return (
		<section ref={rootRef} className='mx-auto max-w-6xl px-4 py-16 sm:py-24'>
			<div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2'>
				<div className='about-graphic relative order-2 mx-auto h-64 w-64 lg:order-1'>
					<div className='absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--color-primary),var(--color-accent)_80%)] opacity-30 blur-2xl' />
					<div className='absolute inset-4 overflow-hidden rounded-full border border-border shadow-lg'>
						<Image
							src='https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=600&q=80&auto=format&fit=crop'
							alt='Students walking across a college campus'
							fill
							sizes='256px'
							className='object-cover'
						/>
					</div>
				</div>
				<div className='about-text order-1 flex flex-col gap-4 lg:order-2'>
					<h2 className='text-3xl font-bold tracking-tight text-foreground'>
						Why FoundIt exists
					</h2>
					<p className='text-muted-foreground'>
						Lost-and-found on campus is scattered across Facebook groups,
						hallway posters, and word of mouth — easy to miss, hard to search.
					</p>
					<p className='text-muted-foreground'>
						FoundIt puts every lost and found report in one searchable,
						campus-wide board, so a lost item has an actual chance of finding
						its way back.
					</p>
				</div>
			</div>
		</section>
	);
}
