export const POST_CATEGORIES = [
	"PHONE",
	"WALLET",
	"ID_CARD",
	"PET",
	"KEYS",
	"ELECTRONICS",
	"BAG",
	"DOCUMENT",
	"CLOTHING",
	"OTHER",
] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];

export const POST_STATUSES = ["LOST", "FOUND"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export type PostImage = {
	url: string;
	order: number;
};

export type Post = {
	id: string;
	title: string;
	description: string;
	category: PostCategory;
	status: PostStatus;
	isResolved: boolean;
	resolvedAt: string | null;
	location: string;
	itemDate: string;
	images: PostImage[];
	authorId: string;
	createdAt: string;
	updatedAt: string;
};

export type PostListResult = {
	posts: Post[];
	nextCursor: string | null;
};

export type PostFormInput = {
	title: string;
	description: string;
	category: PostCategory;
	status: PostStatus;
	location: string;
	itemDate: string;
	images: PostImage[];
};

export type ApiEnvelope<T> = {
	success: boolean;
	message?: string;
	data?: T;
	errors?: unknown;
};
