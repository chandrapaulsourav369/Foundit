"use client";

import { X } from "lucide-react";
import { toast } from "sonner";
import { UploadButton } from "@/utils/uploadthing";
import { PostImage } from "@/types/post";

export default function PostImageUploader({
	images,
	onChange,
}: {
	images: PostImage[];
	onChange: (images: PostImage[]) => void;
}) {
	const removeImage = (url: string) => {
		onChange(images.filter(image => image.url !== url));
	};

	return (
		<div className='space-y-3'>
			{images.length > 0 && (
				<div className='flex flex-wrap gap-3'>
					{images.map((image, index) => (
						<div key={image.url} className='relative size-24'>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={image.url}
								alt={`Upload ${index + 1}`}
								className='size-24 rounded-md object-cover'
							/>
							<button
								type='button'
								onClick={() => removeImage(image.url)}
								className='absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white'
							>
								<X className='size-3' />
							</button>
						</div>
					))}
				</div>
			)}

			{images.length < 5 && (
				<UploadButton
					endpoint='postImages'
					onClientUploadComplete={res => {
						// onUploadComplete on the server returns { url }, so that's the
						// shape delivered here — not UploadThing's raw file.ufsUrl.
						const uploaded = res.map((file, index) => ({
							url: file.url,
							order: images.length + index,
						}));
						onChange([...images, ...uploaded].slice(0, 5));
					}}
					onUploadError={error => {
						toast.error(error.message || "Upload failed");
					}}
				/>
			)}
		</div>
	);
}
