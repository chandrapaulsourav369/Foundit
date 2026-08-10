"use client";

import { useRef } from "react";
import { Star } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const TESTIMONIALS = [
	{
		name: "Priya Nair",
		role: "Sophomore, Computer Science",
		initials: "PN",
		quote:
			"Left my wallet in the library and figured it was gone for good. Someone posted it on FoundIt within the hour and we messaged to sort out a handoff the same day.",
	},
	{
		name: "Daniyar Suleimenov",
		role: "Senior, Mechanical Engineering",
		initials: "DS",
		quote:
			"I found a set of keys near the gym and had no idea whose they were. Posted it as found, tagged the location, and the owner recognized the keychain in the photo right away.",
	},
	{
		name: "Amara Okafor",
		role: "Junior, Business Administration",
		initials: "AO",
		quote:
			"What I like is that everything stays in one feed instead of five different group chats. Searching by category actually works, which sounds basic but nothing else on campus had it.",
	},
];

export function Testimonials() {
	const rootRef = useRef<HTMLElement>(null);

	useGSAP(
		() => {
			const reduced = prefersReducedMotion();

			gsap.from(".testimonial-card", {
				opacity: 0,
				y: 32,
				duration: reduced ? 0 : 0.5,
				stagger: reduced ? 0 : 0.1,
				scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
			});
		},
		{ scope: rootRef }
	);

	return (
		<section
			ref={rootRef}
			className='relative mx-auto max-w-6xl px-4 py-16 sm:py-24'
		>
			<div className='pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,var(--color-secondary),transparent_70%)] opacity-20 blur-3xl' />
			<h2 className='relative mb-12 text-center text-3xl font-bold tracking-tight text-foreground'>
				What people say
			</h2>
			<div className='relative grid grid-cols-1 gap-6 md:grid-cols-3'>
				{TESTIMONIALS.map(t => (
					<div
						key={t.name}
						className='testimonial-card flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm'
					>
						<div className='flex gap-0.5 text-secondary'>
							{Array.from({ length: 5 }).map((_, i) => (
								<Star key={i} className='size-4 fill-current' />
							))}
						</div>
						<p className='flex-1 text-sm text-muted-foreground'>
							&ldquo;{t.quote}&rdquo;
						</p>
						<div className='flex items-center gap-3'>
							<div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-primary),var(--color-accent))] text-sm font-semibold text-primary-foreground'>
								{t.initials}
							</div>
							<div>
								<p className='text-sm font-semibold text-foreground'>{t.name}</p>
								<p className='text-xs text-muted-foreground'>{t.role}</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
