"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const CATEGORIES = [
	{
		label: "Bags & backpacks",
		image:
			"https://images.unsplash.com/photo-1681334921874-5bafe8acf433?w=800&q=80&auto=format&fit=crop",
	},
	{
		label: "Keys",
		image:
			"https://images.unsplash.com/photo-1635237393049-55046279ebb8?w=800&q=80&auto=format&fit=crop",
	},
	{
		label: "Phones & electronics",
		image:
			"https://images.unsplash.com/photo-1730818027473-176ab8a3bb4c?w=800&q=80&auto=format&fit=crop",
	},
	{
		label: "Wallets & IDs",
		image:
			"https://images.unsplash.com/photo-1639789972200-4c5dafacb6fd?w=800&q=80&auto=format&fit=crop",
	},
];

export function Gallery() {
	const rootRef = useRef<HTMLElement>(null);

	useGSAP(
		() => {
			const reduced = prefersReducedMotion();

			gsap.from(".gallery-tile", {
				opacity: 0,
				y: 32,
				duration: reduced ? 0 : 0.5,
				stagger: reduced ? 0 : 0.08,
				scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
			});
		},
		{ scope: rootRef }
	);

	return (
		<section ref={rootRef} className='mx-auto max-w-6xl px-4 py-16 sm:py-24'>
			<h2 className='mb-12 text-center text-3xl font-bold tracking-tight text-foreground'>
				What people report
			</h2>
			<div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
				{CATEGORIES.map(category => (
					<div
						key={category.label}
						className='gallery-tile group relative h-48 overflow-hidden rounded-2xl border border-border shadow-sm transition-[transform,border-color,box-shadow] hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg'
					>
						<Image
							src={category.image}
							alt={category.label}
							fill
							sizes='(min-width: 640px) 25vw, 50vw'
							className='object-cover transition-transform duration-500 group-hover:scale-105'
						/>
						<div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/0 to-transparent' />
						<span className='absolute bottom-3 left-3 text-sm font-semibold text-white'>
							{category.label}
						</span>
					</div>
				))}
			</div>
		</section>
	);
}
