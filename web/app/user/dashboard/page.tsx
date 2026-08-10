import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/action";
import { getSession } from "@/lib/auth/session";
import { listUserListingsAction } from "@/lib/users/actions";
import DashboardShell from "./_components/DashboardShell";

export default async function DashboardPage() {
	const session = await getSession();
	if (!session) {
		redirect("/auth/signin");
	}

	const [profileResult, listingsResult] = await Promise.all([
		getProfile(),
		listUserListingsAction(session.user.id),
	]);

	if (!profileResult.success || !profileResult.data) {
		redirect("/auth/signin");
	}

	const posts =
		listingsResult.success && listingsResult.data
			? listingsResult.data.posts
			: [];

	return (
		<DashboardShell user={profileResult.data.user} posts={posts} />
	);
}
