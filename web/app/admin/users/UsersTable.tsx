"use client";

import { useEffect, useState } from "react";
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
import { useAuth } from "@/context/auth.context";
import { adminListUsersAction, adminUpdateUserStatusAction } from "@/lib/admin/actions";
import { AdminUserRow } from "@/types/social";

export default function UsersTable() {
	const { user: currentUser } = useAuth();
	const [users, setUsers] = useState<AdminUserRow[]>([]);

	useEffect(() => {
		adminListUsersAction().then(result => {
			if (result.success && result.data) {
				setUsers(result.data.users);
			}
		});
	}, []);

	async function toggleBan(user: AdminUserRow) {
		const nextStatus = user.isActive ? "BANNED" : "ACTIVE";
		const result = await adminUpdateUserStatusAction(user.id, nextStatus);
		if (!result.success) {
			toast.error(result.message || "Failed to update user status");
			return;
		}
		setUsers(prev =>
			prev.map(u => (u.id === user.id ? { ...u, isActive: nextStatus === "ACTIVE" } : u)),
		);
		toast.success(nextStatus === "BANNED" ? "User banned" : "User unbanned");
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
					{users.map(user => {
						const canModerate =
							user.role !== "ADMIN" && user.id !== currentUser?.id;

						return (
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
									<StatusBadge status={user.isActive ? "ACTIVE" : "BANNED"} />
								</TableCell>
								<TableCell className='text-muted-foreground'>
									{new Date(user.createdAt).toLocaleDateString()}
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
											{canModerate && (
												<DropdownMenuItem onClick={() => toggleBan(user)}>
													{user.isActive ? "Ban" : "Unban"}
												</DropdownMenuItem>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
