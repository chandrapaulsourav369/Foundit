"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function AuthRequiredToast() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!searchParams.get("authRequired")) return;

		toast.error("Please log in to continue");

		const params = new URLSearchParams(searchParams);
		params.delete("authRequired");
		router.replace(params.size ? `${pathname}?${params}` : pathname);
	}, [searchParams, router, pathname]);

	return null;
}
