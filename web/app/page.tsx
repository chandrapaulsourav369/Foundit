import { Hero } from "./_components/landing/Hero";
import { About } from "./_components/landing/About";
import { Features } from "./_components/landing/Features";
import { Gallery } from "./_components/landing/Gallery";
import { HowItWorks } from "./_components/landing/HowItWorks";
import { Testimonials } from "./_components/landing/Testimonials";
import { CtaBanner } from "./_components/landing/CtaBanner";
import { Faq } from "./_components/landing/Faq";

export default function LandingPage() {
	return (
		<main className='relative'>
			<div className='pointer-events-none fixed inset-0 -z-10 overflow-hidden'>
				<div className='absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,var(--color-primary),transparent_70%)] opacity-20 blur-3xl' />
				<div className='absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,var(--color-accent),transparent_70%)] opacity-20 blur-3xl' />
				<div className='absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-[radial-gradient(circle,var(--color-secondary),transparent_70%)] opacity-15 blur-3xl' />
			</div>
			<Hero />
			<About />
			<Features />
			<Gallery />
			<HowItWorks />
			<Testimonials />
			<CtaBanner />
			<Faq />
		</main>
	);
}
