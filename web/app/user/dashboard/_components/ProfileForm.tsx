"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/lib/users/actions";
import { MyProfile } from "@/types/user";

const BIO_MAX = 280;

export default function ProfileForm({ user }: { user: MyProfile }) {
	const [name, setName] = useState(user.name);
	const [bio, setBio] = useState(user.bio ?? "");
	const [location, setLocation] = useState(user.location ?? "");
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string[]>>({});

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setSubmitting(true);
		setErrors({});

		const result = await updateProfileAction({ name, bio, location });
		setSubmitting(false);

		if (!result.success) {
			setErrors((result.errors as Record<string, string[]>) ?? {});
			toast.error(result.message || "Failed to update profile");
			return;
		}

		toast.success("Profile updated");
	}

	return (
		<form onSubmit={handleSubmit} className='max-w-lg space-y-5'>
			<div className='space-y-2'>
				<Label htmlFor='name'>Name</Label>
				<Input
					id='name'
					value={name}
					onChange={e => setName(e.target.value)}
					required
				/>
				{errors.name && (
					<p className='text-sm text-destructive'>{errors.name[0]}</p>
				)}
			</div>

			<div className='space-y-2'>
				<div className='flex items-center justify-between'>
					<Label htmlFor='bio'>Bio</Label>
					<span className='text-xs text-muted-foreground'>
						{bio.length}/{BIO_MAX}
					</span>
				</div>
				<Textarea
					id='bio'
					value={bio}
					onChange={e => setBio(e.target.value.slice(0, BIO_MAX))}
					placeholder='Tell people a little about yourself'
					rows={4}
				/>
				{errors.bio && (
					<p className='text-sm text-destructive'>{errors.bio[0]}</p>
				)}
			</div>

			<div className='space-y-2'>
				<Label htmlFor='location'>Location</Label>
				<Input
					id='location'
					value={location}
					onChange={e => setLocation(e.target.value)}
					placeholder='City, area'
				/>
				{errors.location && (
					<p className='text-sm text-destructive'>{errors.location[0]}</p>
				)}
			</div>

			<Button type='submit' disabled={submitting}>
				{submitting ? "Saving..." : "Save changes"}
			</Button>
		</form>
	);
}
