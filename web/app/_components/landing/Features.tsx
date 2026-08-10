"use client";

import { useRef } from "react";
import {
	MapPinned,
	Camera,
	MessageCircle,
	Bell,
	CheckCircle2,
	ShieldAlert,
} from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const FEATURES = [
	{
		icon: MapPinned,
		title: "Categorized reports",
		description:
			"Phones, wallets, IDs, pets, keys, electronics, bags, documents, clothing & more.",
	},
	{
		icon: Camera,
		title: "Photo evidence",
		description: "Upload photos so the right owner recognizes their item at a glance.",
	},
	{
		icon: MessageCircle,
		title: "Direct messaging",
		description: "Chat with the finder or owner to arrange a handoff.",
	},
	{
		icon: Bell,
		title: "Live notifications",
		description: "Know the moment someone responds to your post.",
	},
	{
		icon: CheckCircle2,
		title: "Resolved tracking",
		description: "Mark items reunited so the feed stays current, not cluttered.",
	},
	{
		icon: ShieldAlert,
		title: "Community moderation",
		description: "Flag wrong-category or spam posts to keep the board trustworthy.",
	},
];

export function Features() {
	const rootRef = useRef<HTMLElement>(null);

	useGSAP(
		() => {
			const reduced = prefersReducedMotion();

			gsap.from(".feature-card", {
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
				Everything you need to reunite an item
			</h2>
			<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
				{FEATURES.map(feature => (
					<div
						key={feature.title}
						className='feature-card group rounded-2xl border border-border bg-card p-6 shadow-sm transition-[transform,border-color,box-shadow] hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg'
					>
						<div className='mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground'>
							<feature.icon className='size-6' />
						</div>
						<h3 className='mb-2 text-lg font-semibold text-foreground'>
							{feature.title}
						</h3>
						<p className='text-sm text-muted-foreground'>{feature.description}</p>
					</div>
				))}
			</div>
		</section>
	);
}
