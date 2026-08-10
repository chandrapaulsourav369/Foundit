"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const HEADLINE_LINE_1 = "Lost something? Found something?".split(" ");

export function Hero() {
	const rootRef = useRef<HTMLElement>(null);
	const pathRef = useRef<SVGPathElement>(null);

	useGSAP(
		() => {
			const reduced = prefersReducedMotion();
			const path = pathRef.current;

			if (path) {
				const length = path.getTotalLength();
				gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
			}

			const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

			tl.from(".hero-word", {
				opacity: 0,
				y: 24,
				stagger: reduced ? 0 : 0.05,
				duration: reduced ? 0 : 0.6,
			})
				.from(
					".hero-sub",
					{
						opacity: 0,
						y: 16,
						stagger: reduced ? 0 : 0.1,
						duration: reduced ? 0 : 0.5,
					},
					"-=0.2"
				)
				.from(
					".hero-cta",
					{
						opacity: 0,
						y: 16,
						stagger: reduced ? 0 : 0.1,
						duration: reduced ? 0 : 0.5,
					},
					"<"
				)
				.from(
					".hero-card-lost",
					{ opacity: 0, x: -60, rotate: -14, duration: reduced ? 0 : 0.7 },
					"-=0.3"
				)
				.from(
					".hero-card-found",
					{ opacity: 0, x: 60, rotate: 10, duration: reduced ? 0 : 0.7 },
					"-=0.5"
				);

			tl.from(
				".hero-glow",
				{ opacity: 0, scale: 0.7, duration: reduced ? 0 : 0.9 },
				0
			);

			if (path) {
				tl.to(
					path,
					{ strokeDashoffset: 0, duration: reduced ? 0 : 0.8, ease: "power1.inOut" },
					"-=0.2"
				);
			}

			tl.from(
				".hero-pulse",
				{ opacity: 0, scale: 0, duration: reduced ? 0 : 0.4 },
				"-=0.1"
			);

			if (!reduced) {
				gsap.to(".hero-pulse-ring", {
					scale: 2.4,
					opacity: 0,
					duration: 1.8,
					repeat: -1,
					ease: "power1.out",
					transformOrigin: "center",
				});

				gsap.to(".hero-card-lost", {
					y: "+=10",
					duration: 2.4,
					repeat: -1,
					yoyo: true,
					ease: "sine.inOut",
					delay: 1,
				});
				gsap.to(".hero-card-found", {
					y: "-=10",
					duration: 2.6,
					repeat: -1,
					yoyo: true,
					ease: "sine.inOut",
					delay: 1.3,
				});
			}
		},
		{ scope: rootRef }
	);

	return (
		<section
			ref={rootRef}
			className='relative -mt-20 flex min-h-screen items-center overflow-hidden pt-32 pb-16 sm:pt-40'
		>
			<Image
				src='https://images.unsplash.com/photo-1747502064507-ed08d79802db?w=1920&q=80&auto=format&fit=crop'
				alt=''
				fill
				priority
				sizes='100vw'
				className='-z-20 object-cover'
			/>
			<div className='absolute inset-0 -z-10 bg-linear-to-b from-black/70 via-black/55 to-black/75' />
			<div className='absolute inset-0 -z-10 bg-[linear-gradient(160deg,var(--color-primary)/50%,transparent_60%)] mix-blend-multiply' />

			<div className='mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2'>
				<div className='flex flex-col items-start gap-6 text-left'>
					<h1 className='max-w-xl text-5xl font-bold tracking-tight text-white sm:text-6xl'>
						<span className='block'>
							{HEADLINE_LINE_1.map((word, i) => (
								<span key={`l1-${i}`} className='hero-word mr-3 inline-block'>
									{word}
								</span>
							))}
						</span>
						<span className='hero-word hero-gradient-text block bg-[linear-gradient(90deg,var(--color-primary),var(--color-secondary),var(--color-accent),var(--color-primary))] bg-size-[300%_auto] bg-clip-text text-transparent'>
							Let&apos;s reunite it.
						</span>
					</h1>
					<p className='hero-sub max-w-xl text-xl text-white/85'>
						FoundIt is your campus lost &amp; found board — report an item in
						seconds, or browse the feed to see if someone already found yours.
					</p>
					<div className='flex flex-wrap items-center gap-4'>
						<Button
							asChild
							size='lg'
							className='hero-cta h-12 px-8 text-base transition-[transform,background-color,box-shadow] bg-[linear-gradient(90deg,var(--color-primary),var(--color-accent))] hover:opacity-90'
						>
							<Link href='/feed'>Browse the feed</Link>
						</Button>
						<Button
							asChild
							size='lg'
							variant='outline'
							className='hero-cta h-12 border-white/40 bg-white/10 px-8 text-base text-white transition-[transform,background-color,box-shadow] hover:bg-white/20 hover:text-white'
						>
							<Link href='/posts/create'>Report an item</Link>
						</Button>
					</div>
				</div>

				<div className='relative mx-auto h-96 w-full max-w-lg'>
					<div className='hero-glow pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--color-primary),var(--color-secondary)_45%,var(--color-accent)_75%,transparent_75%)] opacity-40 blur-3xl' />

					<svg
						viewBox='0 0 400 260'
						className='absolute inset-0 h-full w-full'
						aria-hidden='true'
					>
						<defs>
							<linearGradient id='hero-path-gradient' x1='0%' y1='0%' x2='100%' y2='0%'>
								<stop offset='0%' stopColor='var(--color-primary)' />
								<stop offset='100%' stopColor='var(--color-secondary)' />
							</linearGradient>
						</defs>
						<path
							ref={pathRef}
							d='M95,90 C160,70 230,190 305,185'
							stroke='url(#hero-path-gradient)'
							strokeWidth='2'
							fill='none'
						/>
						<circle
							className='hero-pulse-ring'
							cx='196'
							cy='132'
							r='6'
							fill='none'
							stroke='var(--color-secondary)'
							strokeWidth='1.5'
						/>
						<circle className='hero-pulse' cx='196' cy='132' r='4' fill='var(--color-secondary)' />
					</svg>

					<div className='hero-card-lost absolute left-6 top-4 w-56 -rotate-6 rounded-2xl border border-border bg-card p-4 shadow-xl'>
						<span className='mb-2 inline-block rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive'>
							LOST
						</span>
						<div className='flex h-20 items-center justify-center rounded-lg bg-muted text-4xl'>
							🎒
						</div>
						<div className='mt-3 h-2.5 w-3/4 rounded bg-muted' />
						<div className='mt-1.5 h-2.5 w-1/2 rounded bg-muted' />
					</div>

					<div className='hero-card-found absolute bottom-4 right-6 w-56 rotate-3 rounded-2xl border border-border bg-card p-4 shadow-xl'>
						<span className='mb-2 inline-block rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-bold text-secondary'>
							FOUND
						</span>
						<div className='flex h-20 items-center justify-center rounded-lg bg-muted text-4xl'>
							🔑
						</div>
						<div className='mt-3 h-2.5 w-3/4 rounded bg-muted' />
						<div className='mt-1.5 h-2.5 w-1/2 rounded bg-muted' />
					</div>
				</div>
			</div>
		</section>
	);
}
