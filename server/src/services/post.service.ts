import { Post, PostDocument } from '#models/post.model.ts';
import {
  CreatePostDto,
  ListPostsQuery,
  ListPostsResult,
  PublicPost,
  UpdatePostDto,
} from '#src/types/post.js';

function toPublicPost(post: PostDocument): PublicPost {
  const { deletedAt, ...rest } = post;
  return rest as PublicPost;
}

function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}_${id}`).toString(
    'base64url'
  );
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } {
  const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
  const separatorIndex = decoded.lastIndexOf('_');
  return {
    createdAt: new Date(decoded.slice(0, separatorIndex)),
    id: decoded.slice(separatorIndex + 1),
  };
}

export async function createPost(data: CreatePostDto): Promise<PublicPost> {
  const post = await Post.create(data);
  return toPublicPost(post.toObject());
}

export async function findPostById(id: string): Promise<PublicPost | null> {
  const post = await Post.findOne({ _id: id, deletedAt: null });
  return post ? toPublicPost(post.toObject()) : null;
}

export async function listPosts(
  query: ListPostsQuery
): Promise<ListPostsResult> {
  const filter: Record<string, unknown> = { deletedAt: null };

  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  if (query.resolved !== undefined) filter.isResolved = query.resolved;
  if (query.search) filter.$text = { $search: query.search };

  if (query.cursor) {
    const { createdAt, id } = decodeCursor(query.cursor);
    filter.$or = [
      { createdAt: { $lt: createdAt } },
      { createdAt, _id: { $lt: id } },
    ];
  }

  const docs = await Post.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(query.limit + 1);

  const hasMore = docs.length > query.limit;
  const page = hasMore ? docs.slice(0, query.limit) : docs;
  const last = page[page.length - 1];

  return {
    posts: page.map(doc => toPublicPost(doc.toObject())),
    nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
  };
}

export async function updatePost(
  id: string,
  data: UpdatePostDto
): Promise<PublicPost> {
  const post = await Post.findOneAndUpdate(
    { _id: id, deletedAt: null },
    data,
    { new: true }
  );
  if (!post) {
    throw new Error('Post not found');
  }
  return toPublicPost(post.toObject());
}

export async function resolvePost(
  id: string,
  isResolved: boolean
): Promise<PublicPost> {
  const post = await Post.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { isResolved, resolvedAt: isResolved ? new Date() : null },
    { new: true }
  );
  if (!post) {
    throw new Error('Post not found');
  }
  return toPublicPost(post.toObject());
}

export async function softDeletePost(id: string): Promise<void> {
  const post = await Post.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() }
  );
  if (!post) {
    throw new Error('Post not found');
  }
}

export function isOwnerOrAdmin(
  userId: string,
  role: string | undefined,
  authorId: string
): boolean {
  return userId === authorId || role === 'ADMIN';
}
