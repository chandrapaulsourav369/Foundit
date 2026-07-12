"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import StatusBadge from "@/components/StatusBadge";
import { mockAdminUsers } from "@/lib/mock-data";
import { AdminUserRow } from "@/types/social";

export default function UsersTable() {
	const [users, setUsers] = useState<AdminUserRow[]>(mockAdminUsers);

	function toggleBan(id: string) {
		setUsers(prev =>
			prev.map(u =>
				u.id === id
					? { ...u, status: u.status === "BANNED" ? "ACTIVE" : "BANNED" }
					: u,
			),
		);
		const user = users.find(u => u.id === id);
		toast.success(
			user?.status === "BANNED" ? "User unbanned" : "User banned",
		);
	}

	function deleteUser(id: string) {
		setUsers(prev => prev.filter(u => u.id !== id));
		toast.success("User deleted");
	}

	return (
		<div className='overflow-x-auto rounded-lg border'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>User</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Joined</TableHead>
						<TableHead className='text-right'>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map(user => (
						<TableRow key={user.id}>
							<TableCell>
								<div className='flex items-center gap-3'>
									<UserAvatar
										name={user.name}
										avatarUrl={user.avatarUrl}
										className='size-8'
									/>
									<span className='font-medium'>{user.name}</span>
								</div>
							</TableCell>
							<TableCell className='text-muted-foreground'>
								{user.email}
							</TableCell>
							<TableCell>{user.role}</TableCell>
							<TableCell>
								<StatusBadge status={user.status} />
							</TableCell>
							<TableCell className='text-muted-foreground'>
								{new Date(user.joinedAt).toLocaleDateString()}
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
											<Link href={`/profile/${user.id}`}>View</Link>
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => toggleBan(user.id)}>
											{user.status === "BANNED" ? "Unban" : "Ban"}
										</DropdownMenuItem>
										<DropdownMenuItem
											variant='destructive'
											onClick={() => deleteUser(user.id)}
										>
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
