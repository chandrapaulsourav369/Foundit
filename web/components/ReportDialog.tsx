"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_REASONS } from "@/lib/mock-data";

export default function ReportDialog({
	targetLabel = "this post",
}: {
	targetLabel?: string;
}) {
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState<string>("");
	const [details, setDetails] = useState("");
	const [submitting, setSubmitting] = useState(false);

	async function handleSubmit() {
		if (!reason) {
			toast.error("Please select a reason");
			return;
		}
		setSubmitting(true);
		await new Promise(resolve => setTimeout(resolve, 500));
		setSubmitting(false);
		setOpen(false);
		setReason("");
		setDetails("");
		toast.success("Report submitted. Our team will review it shortly.");
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant='outline' size='sm'>
					<Flag /> Report
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Report {targetLabel}</DialogTitle>
					<DialogDescription>
						Let us know what&apos;s wrong. Reports are reviewed by our
						moderation team.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Reason</label>
						<Select value={reason} onValueChange={setReason}>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder='Select a reason' />
							</SelectTrigger>
							<SelectContent>
								{REPORT_REASONS.map(r => (
									<SelectItem key={r} value={r}>
										{r}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Details (optional)</label>
						<Textarea
							value={details}
							onChange={e => setDetails(e.target.value)}
							placeholder='Add any extra context...'
							rows={4}
						/>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant='ghost'>Cancel</Button>
					</DialogClose>
					<Button onClick={handleSubmit} disabled={submitting}>
						{submitting ? "Submitting..." : "Submit report"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
