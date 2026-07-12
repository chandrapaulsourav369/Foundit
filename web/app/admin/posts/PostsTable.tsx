"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/StatusBadge";
import { mockAdminPosts } from "@/lib/mock-data";
import { AdminPostRow } from "@/types/social";

export default function PostsTable() {
	const [posts, setPosts] = useState<AdminPostRow[]>(mockAdminPosts);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("ALL");

	const filtered = useMemo(
		() =>
			posts.filter(post => {
				const matchesSearch = post.title
					.toLowerCase()
					.includes(search.toLowerCase());
				const matchesStatus =
					statusFilter === "ALL" || post.status === statusFilter;
				return matchesSearch && matchesStatus;
			}),
		[posts, search, statusFilter],
	);

	function removePost(id: string) {
		setPosts(prev => prev.filter(p => p.id !== id));
		toast.success("Post removed");
	}

	return (
		<div className='space-y-4'>
			<div className='flex flex-wrap gap-3'>
				<Input
					value={search}
					onChange={e => setSearch(e.target.value)}
					placeholder='Search posts...'
					className='max-w-xs'
				/>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className='w-36'>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='ALL'>All statuses</SelectItem>
						<SelectItem value='LOST'>Lost</SelectItem>
						<SelectItem value='FOUND'>Found</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className='overflow-x-auto rounded-lg border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Author</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Resolved</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className='text-right'>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filtered.map(post => (
							<TableRow key={post.id}>
								<TableCell className='font-medium'>{post.title}</TableCell>
								<TableCell className='text-muted-foreground'>
									{post.authorName}
								</TableCell>
								<TableCell>{post.category.replace("_", " ")}</TableCell>
								<TableCell>
									<StatusBadge status={post.status} />
								</TableCell>
								<TableCell>{post.isResolved ? "Yes" : "No"}</TableCell>
								<TableCell className='text-muted-foreground'>
									{new Date(post.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell className='text-right'>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant='ghost' size='icon-sm'>
												<MoreHorizontal className='size-4' />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end'>
											<DropdownMenuItem asChild>
												<Link href={`/posts/${post.id}`}>View</Link>
											</DropdownMenuItem>
											<DropdownMenuItem
												variant='destructive'
												onClick={() => removePost(post.id)}
											>
												Remove
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
