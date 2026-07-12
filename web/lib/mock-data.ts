import {
	AdminPostRow,
	AdminStat,
	AdminUserRow,
	Comment,
	Conversation,
	Notification,
	ProfilePost,
	PublicUser,
	Report,
} from "@/types/social";

export const mockUsers: PublicUser[] = [
	{
		id: "u1",
		name: "Ayesha Rahman",
		email: "ayesha.rahman@example.com",
		avatarUrl: "https://i.pravatar.cc/150?img=47",
		bio: "Grad student. Left my headphones somewhere on campus more times than I'd like to admit.",
		location: "Dhaka, Bangladesh",
		joinedAt: "2024-11-02",
		stats: { posts: 12, found: 5, resolved: 9 },
	},
	{
		id: "u2",
		name: "Tanvir Hasan",
		email: "tanvir.hasan@example.com",
		avatarUrl: "https://i.pravatar.cc/150?img=12",
		bio: "Campus security volunteer. I check the lost & found board every day.",
		location: "Dhaka, Bangladesh",
		joinedAt: "2024-08-15",
		stats: { posts: 27, found: 19, resolved: 22 },
	},
	{
		id: "u3",
		name: "Nusrat Jahan",
		email: "nusrat.jahan@example.com",
		avatarUrl: "https://i.pravatar.cc/150?img=32",
		bio: "Lost my cat near the library last week — still looking.",
		location: "Gulshan, Dhaka",
		joinedAt: "2025-01-20",
		stats: { posts: 4, found: 1, resolved: 1 },
	},
];

export const currentMockUser = mockUsers[0];

export function getMockUser(id: string): PublicUser {
	return mockUsers.find(u => u.id === id) ?? mockUsers[0];
}

export const mockComments: Comment[] = [
	{
		id: "c1",
		postId: "1",
		author: mockUsers[1],
		body: "I think I saw this near the north gate cafeteria yesterday evening. Have you checked with lost & found there?",
		createdAt: "2026-07-10T14:20:00Z",
	},
	{
		id: "c2",
		postId: "1",
		author: mockUsers[2],
		body: "Following this post — hope you find it soon!",
		createdAt: "2026-07-11T09:05:00Z",
	},
];

export const mockConversations: Conversation[] = [
	{
		id: "conv1",
		participant: mockUsers[1],
		postTitle: "Black leather wallet",
		lastMessage: "Sounds good, I'll bring it to the library entrance at 5pm.",
		lastMessageAt: "2026-07-12T10:32:00Z",
		unreadCount: 2,
		messages: [
			{
				id: "m1",
				conversationId: "conv1",
				senderId: "u2",
				body: "Hi! I think I found your wallet near the cafeteria.",
				createdAt: "2026-07-12T09:58:00Z",
			},
			{
				id: "m2",
				conversationId: "conv1",
				senderId: "u1",
				body: "Oh amazing, thank you! Does it have a blue student ID inside?",
				createdAt: "2026-07-12T10:01:00Z",
			},
			{
				id: "m3",
				conversationId: "conv1",
				senderId: "u2",
				body: "Yes, exactly that one. Where can we meet?",
				createdAt: "2026-07-12T10:15:00Z",
			},
			{
				id: "m4",
				conversationId: "conv1",
				senderId: "u2",
				body: "Sounds good, I'll bring it to the library entrance at 5pm.",
				createdAt: "2026-07-12T10:32:00Z",
			},
		],
	},
	{
		id: "conv2",
		participant: mockUsers[2],
		postTitle: "Grey tabby cat",
		lastMessage: "No worries, I'll keep an eye out around the park.",
		lastMessageAt: "2026-07-11T18:04:00Z",
		unreadCount: 0,
		messages: [
			{
				id: "m5",
				conversationId: "conv2",
				senderId: "u1",
				body: "Hey, did you see a grey tabby cat with a red collar?",
				createdAt: "2026-07-11T17:40:00Z",
			},
			{
				id: "m6",
				conversationId: "conv2",
				senderId: "u3",
				body: "No worries, I'll keep an eye out around the park.",
				createdAt: "2026-07-11T18:04:00Z",
			},
		],
	},
];

export function getMockConversation(id: string): Conversation | undefined {
	return mockConversations.find(c => c.id === id);
}

export const mockNotifications: Notification[] = [
	{
		id: "n1",
		type: "message",
		title: "New message from Tanvir Hasan",
		body: "Sounds good, I'll bring it to the library entrance at 5pm.",
		createdAt: "2026-07-12T10:32:00Z",
		read: false,
	},
	{
		id: "n2",
		type: "comment",
		title: "New comment on your post",
		body: "Nusrat Jahan commented on \"Black leather wallet\"",
		createdAt: "2026-07-11T09:05:00Z",
		read: false,
	},
	{
		id: "n3",
		type: "admin",
		title: "Post approved",
		body: "Your post \"Grey tabby cat\" was reviewed and approved.",
		createdAt: "2026-07-10T08:00:00Z",
		read: true,
	},
	{
		id: "n4",
		type: "report",
		title: "Report resolved",
		body: "Your report on \"Suspicious duplicate listing\" was resolved.",
		createdAt: "2026-07-08T12:00:00Z",
		read: true,
	},
];

export const mockReports: Report[] = [
	{
		id: "r1",
		post: { id: "1", title: "Black leather wallet", status: "LOST" },
		reason: "Spam or duplicate",
		details: "This looks like a duplicate of another listing posted an hour earlier.",
		status: "RESOLVED",
		submittedAt: "2026-07-05T11:00:00Z",
		adminResponse: "Thanks for flagging — the duplicate has been removed.",
	},
	{
		id: "r2",
		post: { id: "2", title: "Grey tabby cat", status: "FOUND" },
		reason: "Inappropriate content",
		details: "Description contains contact info that violates the privacy policy.",
		status: "REVIEWING",
		submittedAt: "2026-07-11T15:30:00Z",
		adminResponse: null,
	},
	{
		id: "r3",
		post: { id: "3", title: "Silver house keys", status: "FOUND" },
		reason: "Wrong category",
		details: "Listed as electronics but it's clearly keys.",
		status: "PENDING",
		submittedAt: "2026-07-12T08:15:00Z",
		adminResponse: null,
	},
];

export const mockAdminStats: AdminStat[] = [
	{ label: "Total Users", value: "1,248", change: "+12%", trend: "up" },
	{ label: "Total Posts", value: "3,421", change: "+8%", trend: "up" },
	{ label: "Resolved", value: "2,105", change: "+18%", trend: "up" },
	{ label: "Reports", value: "27", change: "-5%", trend: "down" },
];

export const mockAdminUsers: AdminUserRow[] = [
	{
		id: "u1",
		name: "Ayesha Rahman",
		email: "ayesha.rahman@example.com",
		avatarUrl: "https://i.pravatar.cc/150?img=47",
		role: "USER",
		status: "ACTIVE",
		joinedAt: "2024-11-02",
	},
	{
		id: "u2",
		name: "Tanvir Hasan",
		email: "tanvir.hasan@example.com",
		avatarUrl: "https://i.pravatar.cc/150?img=12",
		role: "ADMIN",
		status: "ACTIVE",
		joinedAt: "2024-08-15",
	},
	{
		id: "u3",
		name: "Nusrat Jahan",
		email: "nusrat.jahan@example.com",
		avatarUrl: "https://i.pravatar.cc/150?img=32",
		role: "USER",
		status: "BANNED",
		joinedAt: "2025-01-20",
	},
	{
		id: "u4",
		name: "Rafiq Islam",
		email: "rafiq.islam@example.com",
		avatarUrl: "https://i.pravatar.cc/150?img=8",
		role: "USER",
		status: "ACTIVE",
		joinedAt: "2025-03-11",
	},
];

export const mockAdminPosts: AdminPostRow[] = [
	{
		id: "1",
		title: "Black leather wallet",
		status: "LOST",
		category: "WALLET",
		isResolved: false,
		createdAt: "2026-07-10T14:20:00Z",
		authorName: "Ayesha Rahman",
	},
	{
		id: "2",
		title: "Grey tabby cat",
		status: "FOUND",
		category: "PET",
		isResolved: false,
		createdAt: "2026-07-11T09:05:00Z",
		authorName: "Nusrat Jahan",
	},
	{
		id: "3",
		title: "Silver house keys",
		status: "FOUND",
		category: "KEYS",
		isResolved: true,
		createdAt: "2026-07-09T08:15:00Z",
		authorName: "Tanvir Hasan",
	},
];

const profilePostsByUser: Record<string, ProfilePost[]> = {
	u1: [
		{
			id: "1",
			title: "Black leather wallet",
			status: "LOST",
			category: "WALLET",
			isResolved: false,
			imageUrl: "https://picsum.photos/seed/wallet1/400/300",
		},
		{
			id: "4",
			title: "Blue umbrella",
			status: "LOST",
			category: "OTHER",
			isResolved: true,
			imageUrl: "https://picsum.photos/seed/umbrella1/400/300",
		},
	],
	u2: [
		{
			id: "3",
			title: "Silver house keys",
			status: "FOUND",
			category: "KEYS",
			isResolved: true,
			imageUrl: "https://picsum.photos/seed/keys1/400/300",
		},
	],
	u3: [
		{
			id: "2",
			title: "Grey tabby cat",
			status: "FOUND",
			category: "PET",
			isResolved: false,
			imageUrl: "https://picsum.photos/seed/cat1/400/300",
		},
	],
};

export function getMockUserPosts(userId: string): ProfilePost[] {
	return profilePostsByUser[userId] ?? [];
}

export const REPORT_REASONS = [
	"Spam or duplicate",
	"Inappropriate content",
	"Wrong category",
	"Suspected scam",
	"Other",
] as const;
