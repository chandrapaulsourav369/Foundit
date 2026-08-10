import { Post } from "./post";

export type PublicUser = {
	id: string;
	name: string;
	avatarUrl: string | null;
	bio: string | null;
	location: string | null;
	joinedAt: string;
	stats: {
		posts: number;
		found: number;
		resolved: number;
	};
};

export type CommentAuthor = {
	id: string;
	name: string;
	avatarUrl: string | null;
};

export type Comment = {
	id: string;
	postId: string;
	authorId: string;
	author: CommentAuthor | null;
	body: string;
	createdAt: string;
};

export type Message = {
	id: string;
	conversationId: string;
	senderId: string;
	body: string;
	readBy: string[];
	createdAt: string;
};

export type ConversationParticipant = {
	id: string;
	name: string;
	avatarUrl: string | null;
};

export type Conversation = {
	id: string;
	postId: string;
	participants: string[];
	participant: ConversationParticipant | null;
	lastMessage: string | null;
	lastMessageAt: string;
	unreadCount: number;
};

export type NotificationType =
	| "NEW_COMMENT"
	| "NEW_MESSAGE"
	| "REPORT_UPDATE"
	| "MODERATION";

export type Notification = {
	id: string;
	type: NotificationType;
	title: string;
	body: string;
	link: string | null;
	isRead: boolean;
	createdAt: string;
};

export type ReportReason =
	| "SPAM_DUPLICATE"
	| "INAPPROPRIATE"
	| "WRONG_CATEGORY"
	| "SUSPECTED_SCAM"
	| "OTHER";

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
	{ value: "SPAM_DUPLICATE", label: "Spam or duplicate" },
	{ value: "INAPPROPRIATE", label: "Inappropriate content" },
	{ value: "WRONG_CATEGORY", label: "Wrong category" },
	{ value: "SUSPECTED_SCAM", label: "Suspected scam" },
	{ value: "OTHER", label: "Other" },
];

export type ReportStatus = "PENDING" | "REVIEWING" | "RESOLVED" | "REJECTED";

export type Report = {
	id: string;
	postId: string;
	reason: ReportReason;
	details: string | null;
	status: ReportStatus;
	createdAt: string;
	adminResponse: string | null;
};

export type AdminUserRow = {
	id: string;
	name: string;
	email: string;
	avatarUrl: string | null;
	role: "USER" | "ADMIN";
	isActive: boolean;
	createdAt: string;
};

export type AdminPostRow = Pick<
	Post,
	"id" | "title" | "status" | "category" | "isResolved" | "createdAt"
> & {
	authorName: string;
	deletedAt?: string | null;
};

export type ProfilePost = {
	id: string;
	title: string;
	status: Post["status"];
	category: Post["category"];
	isResolved: boolean;
	images: Post["images"];
};
