import { Post } from "./post";

export type PublicUser = {
	id: string;
	name: string;
	email: string;
	avatarUrl: string | null;
	bio: string;
	location: string;
	joinedAt: string;
	stats: {
		posts: number;
		found: number;
		resolved: number;
	};
};

export type Comment = {
	id: string;
	postId: string;
	author: PublicUser;
	body: string;
	createdAt: string;
};

export type Message = {
	id: string;
	conversationId: string;
	senderId: string;
	body: string;
	createdAt: string;
};

export type Conversation = {
	id: string;
	participant: PublicUser;
	postTitle: string;
	lastMessage: string;
	lastMessageAt: string;
	unreadCount: number;
	messages: Message[];
};

export type NotificationType = "comment" | "message" | "report" | "admin";

export type Notification = {
	id: string;
	type: NotificationType;
	title: string;
	body: string;
	createdAt: string;
	read: boolean;
};

export type ReportStatus = "PENDING" | "REVIEWING" | "RESOLVED" | "REJECTED";

export type Report = {
	id: string;
	post: Pick<Post, "id" | "title" | "status">;
	reason: string;
	details: string;
	status: ReportStatus;
	submittedAt: string;
	adminResponse: string | null;
};

export type AdminUserRow = {
	id: string;
	name: string;
	email: string;
	avatarUrl: string | null;
	role: "USER" | "ADMIN";
	status: "ACTIVE" | "BANNED";
	joinedAt: string;
};

export type AdminPostRow = Pick<
	Post,
	"id" | "title" | "status" | "category" | "isResolved" | "createdAt"
> & {
	authorName: string;
};

export type ProfilePost = {
	id: string;
	title: string;
	status: Post["status"];
	category: Post["category"];
	isResolved: boolean;
	imageUrl: string;
};

export type AdminStat = {
	label: string;
	value: string;
	change: string;
	trend: "up" | "down";
};
