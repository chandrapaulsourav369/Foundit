"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PostImageUploader from "./PostImageUploader";
import {
	postFormSchema,
	PostFormValues,
} from "@/validation/post.validation";
import { POST_CATEGORIES, POST_STATUSES, Post } from "@/types/post";
import { createPostAction, updatePostAction } from "@/lib/posts/actions";

export default function PostForm({ post }: { post?: Post }) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
	} = useForm<PostFormValues>({
		resolver: zodResolver(postFormSchema),
		defaultValues: post
			? {
					title: post.title,
					description: post.description,
					category: post.category,
					status: post.status,
					location: post.location,
					itemDate: post.itemDate.slice(0, 10),
					images: post.images,
				}
			: {
					title: "",
					description: "",
					category: POST_CATEGORIES[0],
					status: POST_STATUSES[0],
					location: "",
					itemDate: "",
					images: [],
				},
	});

	const onSubmit = async (values: PostFormValues) => {
		const result = post
			? await updatePostAction(post.id, values)
			: await createPostAction(values);

		if (!result.success || !result.data) {
			toast.error(result.message || "Something went wrong");
			return;
		}

		toast.success(post ? "Post updated" : "Post created");
		queryClient.invalidateQueries({ queryKey: ["posts"] });
		router.push(`/posts/${result.data.post.id}`);
		router.refresh();
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='max-w-xl space-y-4'>
			<div className='space-y-1'>
				<Label htmlFor='title'>Title</Label>
				<Input id='title' {...register("title")} />
				{errors.title && (
					<p className='text-sm text-destructive'>{errors.title.message}</p>
				)}
			</div>

			<div className='space-y-1'>
				<Label htmlFor='description'>Description</Label>
				<textarea
					id='description'
					rows={4}
					className='w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
					{...register("description")}
				/>
				{errors.description && (
					<p className='text-sm text-destructive'>
						{errors.description.message}
					</p>
				)}
			</div>

			<div className='grid grid-cols-2 gap-4'>
				<div className='space-y-1'>
					<Label htmlFor='category'>Category</Label>
					<select
						id='category'
						className='h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm'
						{...register("category")}
					>
						{POST_CATEGORIES.map(category => (
							<option key={category} value={category}>
								{category.replace("_", " ")}
							</option>
						))}
					</select>
				</div>

				<div className='space-y-1'>
					<Label htmlFor='status'>Status</Label>
					<select
						id='status'
						className='h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm'
						{...register("status")}
					>
						{POST_STATUSES.map(status => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className='space-y-1'>
				<Label htmlFor='location'>Location</Label>
				<Input id='location' {...register("location")} />
				{errors.location && (
					<p className='text-sm text-destructive'>
						{errors.location.message}
					</p>
				)}
			</div>

			<div className='space-y-1'>
				<Label htmlFor='itemDate'>Date</Label>
				<Input id='itemDate' type='date' {...register("itemDate")} />
				{errors.itemDate && (
					<p className='text-sm text-destructive'>
						{errors.itemDate.message}
					</p>
				)}
			</div>

			<div className='space-y-1'>
				<Label>Images</Label>
				<Controller
					control={control}
					name='images'
					render={({ field }) => (
						<PostImageUploader
							images={field.value}
							onChange={field.onChange}
						/>
					)}
				/>
			</div>

			<Button type='submit' disabled={isSubmitting}>
				{post ? "Save changes" : "Create post"}
			</Button>
		</form>
	);
}
