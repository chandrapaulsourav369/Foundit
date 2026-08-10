"use client";

import { useRef } from "react";
import { MapPinned, Search, MessageCircle } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const STEPS = [
	{
		icon: MapPinned,
		title: "Report",
		description: "Post what you lost or found — category, location, photos.",
	},
	{
		icon: Search,
		title: "Browse",
		description: "Search the campus-wide feed by category, status, or keyword.",
	},
	{
		icon: MessageCircle,
		title: "Reconnect",
		description: "Message the other person directly to arrange a handoff.",
	},
];

export function HowItWorks() {
	const rootRef = useRef<HTMLElement>(null);
	const lineRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const reduced = prefersReducedMotion();

			if (lineRef.current) {
				gsap.fromTo(
					lineRef.current,
					{ scaleX: 0 },
					{
						scaleX: 1,
						duration: reduced ? 0 : 1,
						ease: "none",
						transformOrigin: "left center",
						scrollTrigger: {
							trigger: rootRef.current,
							start: "top 70%",
							end: "bottom 60%",
							scrub: reduced ? false : 0.5,
						},
					}
				);
			}

			gsap.from(".step-badge", {
				scale: 0.5,
				opacity: 0,
				duration: reduced ? 0 : 0.4,
				stagger: reduced ? 0 : 0.15,
				ease: "back.out(2)",
				scrollTrigger: { trigger: rootRef.current, start: "top 70%" },
			});
		},
		{ scope: rootRef }
	);

	return (
		<section ref={rootRef} className='mx-auto max-w-6xl px-4 py-16 sm:py-24'>
			<h2 className='mb-16 text-center text-3xl font-bold tracking-tight text-foreground'>
				How it works
			</h2>
			<div className='relative grid grid-cols-1 gap-12 sm:grid-cols-3'>
				<div
					ref={lineRef}
					className='absolute left-0 right-0 top-6 hidden h-0.5 origin-left scale-x-0 bg-primary sm:block'
				/>
				{STEPS.map(step => (
					<div
						key={step.title}
						className='relative flex flex-col items-center gap-3 text-center'
					>
						<div className='step-badge relative z-10 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground'>
							<step.icon className='size-6' />
						</div>
						<h3 className='text-lg font-semibold text-foreground'>{step.title}</h3>
						<p className='text-sm text-muted-foreground'>{step.description}</p>
					</div>
				))}
			</div>
		</section>
	);
}
