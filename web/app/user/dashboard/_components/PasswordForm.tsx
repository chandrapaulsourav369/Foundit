"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "@/lib/users/actions";

const initialFields = {
	currentPassword: "",
	newPassword: "",
	confirmPassword: "",
};

export default function PasswordForm() {
	const [fields, setFields] = useState(initialFields);
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string[]>>({});

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setSubmitting(true);
		setErrors({});

		const result = await changePasswordAction(fields);
		setSubmitting(false);

		if (!result.success) {
			setErrors((result.errors as Record<string, string[]>) ?? {});
			toast.error(result.message || "Failed to change password");
			return;
		}

		setFields(initialFields);
		toast.success("Password changed");
	}

	return (
		<form onSubmit={handleSubmit} className='max-w-lg space-y-5'>
			<div className='space-y-2'>
				<Label htmlFor='currentPassword'>Current password</Label>
				<Input
					id='currentPassword'
					type='password'
					autoComplete='current-password'
					value={fields.currentPassword}
					onChange={e =>
						setFields(f => ({ ...f, currentPassword: e.target.value }))
					}
					required
				/>
				{errors.currentPassword && (
					<p className='text-sm text-destructive'>
						{errors.currentPassword[0]}
					</p>
				)}
			</div>

			<div className='space-y-2'>
				<Label htmlFor='newPassword'>New password</Label>
				<Input
					id='newPassword'
					type='password'
					autoComplete='new-password'
					value={fields.newPassword}
					onChange={e =>
						setFields(f => ({ ...f, newPassword: e.target.value }))
					}
					required
				/>
				{errors.newPassword && (
					<p className='text-sm text-destructive'>{errors.newPassword[0]}</p>
				)}
			</div>

			<div className='space-y-2'>
				<Label htmlFor='confirmPassword'>Confirm new password</Label>
				<Input
					id='confirmPassword'
					type='password'
					autoComplete='new-password'
					value={fields.confirmPassword}
					onChange={e =>
						setFields(f => ({ ...f, confirmPassword: e.target.value }))
					}
					required
				/>
				{errors.confirmPassword && (
					<p className='text-sm text-destructive'>
						{errors.confirmPassword[0]}
					</p>
				)}
			</div>

			<Button type='submit' disabled={submitting}>
				{submitting ? "Changing..." : "Change password"}
			</Button>
		</form>
	);
}
