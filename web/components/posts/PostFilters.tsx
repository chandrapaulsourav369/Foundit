"use client";

import { Input } from "@/components/ui/input";
import { POST_CATEGORIES, POST_STATUSES } from "@/types/post";

export type PostFiltersValue = {
	search: string;
	category: string;
	status: string;
};

export default function PostFilters({
	value,
	onChange,
}: {
	value: PostFiltersValue;
	onChange: (value: PostFiltersValue) => void;
}) {
	return (
		<div className='flex flex-wrap gap-3'>
			<Input
				placeholder='Search posts...'
				value={value.search}
				onChange={e => onChange({ ...value, search: e.target.value })}
				className='max-w-xs'
			/>

			<select
				className='h-9 rounded-md border border-input bg-transparent px-3 text-sm'
				value={value.category}
				onChange={e => onChange({ ...value, category: e.target.value })}
			>
				<option value=''>All categories</option>
				{POST_CATEGORIES.map(category => (
					<option key={category} value={category}>
						{category.replace("_", " ")}
					</option>
				))}
			</select>

			<select
				className='h-9 rounded-md border border-input bg-transparent px-3 text-sm'
				value={value.status}
				onChange={e => onChange({ ...value, status: e.target.value })}
			>
				<option value=''>Lost &amp; Found</option>
				{POST_STATUSES.map(status => (
					<option key={status} value={status}>
						{status}
					</option>
				))}
			</select>
		</div>
	);
}
