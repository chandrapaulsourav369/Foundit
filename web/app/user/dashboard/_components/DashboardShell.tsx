"use client";

import UserAvatar from "@/components/UserAvatar";
import UserPostGrid from "@/components/posts/UserPostGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyProfile } from "@/types/user";
import { ProfilePost } from "@/types/social";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";

export default function DashboardShell({
	user,
	posts,
}: {
	user: MyProfile;
	posts: ProfilePost[];
}) {
	return (
		<main className='mx-auto max-w-4xl px-4 py-8'>
			<div className='flex flex-col items-center gap-4 rounded-lg border p-8 text-center sm:flex-row sm:text-left'>
				<UserAvatar name={user.name} avatarUrl={user.avatarUrl} className='size-24' />
				<div className='flex-1'>
					<h1 className='text-2xl font-semibold'>{user.name}</h1>
					<p className='text-sm text-muted-foreground'>{user.email}</p>
					{user.bio && (
						<p className='mt-1 text-sm text-muted-foreground'>{user.bio}</p>
					)}
				</div>
			</div>

			<Tabs defaultValue='posts' className='mt-6'>
				<TabsList>
					<TabsTrigger value='posts'>My Posts</TabsTrigger>
					<TabsTrigger value='profile'>Edit Profile</TabsTrigger>
					<TabsTrigger value='password'>Password</TabsTrigger>
				</TabsList>

				<TabsContent value='posts' className='mt-4'>
					<UserPostGrid
						posts={posts}
						emptyDescription="You haven't posted anything yet."
					/>
				</TabsContent>

				<TabsContent value='profile' className='mt-4'>
					<ProfileForm user={user} />
				</TabsContent>

				<TabsContent value='password' className='mt-4'>
					<PasswordForm />
				</TabsContent>
			</Tabs>
		</main>
	);
}
