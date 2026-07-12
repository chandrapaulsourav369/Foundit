"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import PostCard from "./PostCard";
import PostFilters, { PostFiltersValue } from "./PostFilters";
import { listPostsAction } from "@/lib/posts/actions";

const EMPTY_FILTERS: PostFiltersValue = {
	search: "",
	category: "",
	status: "",
};

export default function PostFeed() {
	const [filters, setFilters] = useState<PostFiltersValue>(EMPTY_FILTERS);
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const loadMoreRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const timeoutId = setTimeout(
			() => setDebouncedSearch(filters.search),
			400,
		);
		return () => clearTimeout(timeoutId);
	}, [filters.search]);

	const queryKey = useMemo(
		() => ["posts", debouncedSearch, filters.category, filters.status],
		[debouncedSearch, filters.category, filters.status],
	);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		error,
	} = useInfiniteQuery({
			queryKey,
			queryFn: async ({ pageParam }) => {
				const result = await listPostsAction({
					cursor: pageParam,
					search: debouncedSearch || undefined,
					category: filters.category || undefined,
					status: filters.status || undefined,
				});
				if (!result.success || !result.data) {
					throw new Error(result.message || "Failed to load posts");
				}
				return result.data;
			},
			initialPageParam: undefined as string | undefined,
			getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
		});

	useEffect(() => {
		const node = loadMoreRef.current;
		if (!node) return;

		const observer = new IntersectionObserver(entries => {
			if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
				fetchNextPage();
			}
		});

		observer.observe(node);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const posts = data?.pages.flatMap(page => page.posts) ?? [];

	return (
		<div className='space-y-4'>
			<PostFilters value={filters} onChange={setFilters} />

			{isLoading && (
				<p className='text-sm text-muted-foreground'>Loading posts...</p>
			)}

			{!isLoading && isError && (
				<p className='text-sm text-destructive'>
					{error instanceof Error
						? error.message
						: "Something went wrong loading posts."}
				</p>
			)}

			{!isLoading && !isError && posts.length === 0 && (
				<p className='text-sm text-muted-foreground'>
					No posts match your search yet.
				</p>
			)}

			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
				{posts.map(post => (
					<PostCard key={post.id} post={post} />
				))}
			</div>

			<div ref={loadMoreRef} />
			{isFetchingNextPage && (
				<p className='text-center text-sm text-muted-foreground'>
					Loading more...
				</p>
			)}
		</div>
	);
}
