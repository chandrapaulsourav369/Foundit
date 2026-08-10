import { signOut } from "@/lib/auth/auth";
import { getSession } from "@/lib/auth/session";
import { listNotificationsAction } from "@/lib/notifications/actions";
import { HeaderClient } from "./HeaderClient";

const Header = async () => {
	const session = await getSession();
	const user = session?.user;

	const unreadCount = user
		? (await listNotificationsAction()).data?.unreadCount ?? 0
		: 0;

	return (
		<HeaderClient user={user ?? null} unreadCount={unreadCount} signOutAction={signOut} />
	);
};

export default Header;
