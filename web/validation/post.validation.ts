import { z } from "zod";
import { POST_CATEGORIES, POST_STATUSES } from "@/types/post";

export const postImageSchema = z.object({
	url: z.string().url(),
	order: z.number().int().min(0),
});

export const postFormSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "Title is required")
		.max(120, "Title must be at most 120 characters"),
	description: z
		.string()
		.trim()
		.min(1, "Description is required")
		.max(2000, "Description must be at most 2000 characters"),
	category: z.enum(POST_CATEGORIES),
	status: z.enum(POST_STATUSES),
	location: z.string().trim().min(1, "Location is required"),
	itemDate: z.string().min(1, "Date is required"),
	images: z.array(postImageSchema).max(5, "Up to 5 images allowed"),
});

export type PostFormValues = z.infer<typeof postFormSchema>;
