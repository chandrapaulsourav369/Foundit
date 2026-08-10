import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
	{
		question: "Is FoundIt free to use?",
		answer: "Yes — FoundIt is free for everyone on campus.",
	},
	{
		question: "How do I report a lost or found item?",
		answer:
			"Click \"Report an item\", pick a category and status (lost or found), add a location, date, and photos, then post it to the feed.",
	},
	{
		question: "How do I contact someone about an item I recognize?",
		answer:
			"Open the post and send a message — all contact happens through FoundIt's built-in messaging, so you don't need to share a phone number or email.",
	},
	{
		question: "What happens after an item is marked resolved?",
		answer:
			"The post stays visible with a \"resolved\" status so the feed reflects real, current items instead of piling up with old ones.",
	},
	{
		question: "Is my personal info visible to other users?",
		answer:
			"Only your name and avatar are shown publicly on your posts. Messaging happens in-app, so your phone number and email stay private.",
	},
];

export function Faq() {
	return (
		<section className='mx-auto max-w-3xl px-4 py-16 sm:py-24'>
			<h2 className='mb-12 text-center text-3xl font-bold tracking-tight text-foreground'>
				Frequently asked questions
			</h2>
			<Accordion type='single' collapsible className='w-full'>
				{FAQS.map((faq, i) => (
					<AccordionItem key={faq.question} value={`item-${i}`}>
						<AccordionTrigger className='text-left'>{faq.question}</AccordionTrigger>
						<AccordionContent>{faq.answer}</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</section>
	);
}
