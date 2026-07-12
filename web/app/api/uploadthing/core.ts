// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getSession } from "@/lib/auth/session";

const f = createUploadthing();

export const ourFileRouter = {
	imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
		.middleware(async () => {
			// Optionally authenticate here and return metadata
			return {};
		})
		.onUploadComplete(async ({ file }) => {
			// Called server-side after upload finishes
			return { url: file.ufsUrl };
		}),
	postImages: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
		.middleware(async () => {
			const session = await getSession();
			if (!session?.user) {
				throw new UploadThingError("Unauthorized");
			}
			return { userId: session.user.id };
		})
		.onUploadComplete(async ({ file }) => {
			return { url: file.ufsUrl };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
