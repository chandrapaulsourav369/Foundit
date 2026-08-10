import { Post, PostDocument } from '#models/post.model.ts';
import {
  CreatePostDto,
  ListPostsQuery,
  ListPostsResult,
  PublicPost,
  UpdatePostDto,
} from '#src/types/post.js';
import { getPublicUserSummaries } from '#src/services/user.service.ts';
import { getLikeData } from '#src/services/like.service.ts';
import { getCommentCounts } from '#src/services/comment.service.ts';

const DEFAULT_SOCIAL = { likeCount: 0, likedByMe: false, commentCount: 0 };

function toPublicPost(
  post: PostDocument,
  social: {
    author?: PublicPost['author'];
    likeCount?: number;
    likedByMe?: boolean;
    commentCount?: number;
  } = {}
): PublicPost {
  const { deletedAt, ...rest } = post;
  return { ...rest, ...DEFAULT_SOCIAL, ...social } as PublicPost;
}

// Batches author + like/comment counts for a page of posts in three queries
// total (not N+1) — same pattern as getPublicUserSummaries's own batching.
async function attachSocialData(
  docs: Array<{ id: string; authorId: string; toObject: () => PostDocument }>,
  viewerId?: string
): Promise<PublicPost[]> {
  const ids = docs.map(doc => doc.id);
  const [authors, likeData, commentCounts] = await Promise.all([
    getPublicUserSummaries(docs.map(doc => doc.authorId)),
    getLikeData(ids, viewerId),
    getCommentCounts(ids),
  ]);

  return docs.map(doc =>
    toPublicPost(doc.toObject(), {
      author: authors.get(doc.authorId) ?? null,
      likeCount: likeData.get(doc.id)?.likeCount ?? 0,
      likedByMe: likeData.get(doc.id)?.likedByMe ?? false,
      commentCount: commentCounts.get(doc.id) ?? 0,
    })
  );
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

export async function findPostById(
  id: string,
  viewerId?: string
): Promise<PublicPost | null> {
  const post = await Post.findOne({ _id: id, deletedAt: null });
  if (!post) return null;
  const [withSocial] = await attachSocialData([post], viewerId);
  return withSocial;
}

export async function listPosts(
  query: ListPostsQuery,
  viewerId?: string
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
    posts: await attachSocialData(page, viewerId),
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

export async function adminListPosts(query: {
  search?: string;
  category?: string;
  status?: string;
  resolved?: boolean;
  deleted?: 'true' | 'false' | 'all';
  cursor?: string;
  limit: number;
}): Promise<ListPostsResult> {
  const filter: Record<string, unknown> = {};

  if (query.deleted === 'true') filter.deletedAt = { $ne: null };
  else if (query.deleted !== 'all') filter.deletedAt = null;

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

  const authors = await getPublicUserSummaries(page.map(doc => doc.authorId));

  return {
    posts: page.map(doc => ({
      ...(doc.toObject() as unknown as PublicPost),
      authorName: authors.get(doc.authorId)?.name ?? 'Unknown',
    })) as unknown as PublicPost[],
    nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
  };
}

export async function restorePost(id: string): Promise<PublicPost> {
  const post = await Post.findOneAndUpdate(
    { _id: id, deletedAt: { $ne: null } },
    { deletedAt: null },
    { new: true }
  );
  if (!post) {
    throw new Error('Post not found or not deleted');
  }
  return toPublicPost(post.toObject());
}

export async function countPostStats(): Promise<{
  total: number;
  resolved: number;
}> {
  const [total, resolved] = await Promise.all([
    Post.countDocuments({ deletedAt: null }),
    Post.countDocuments({ deletedAt: null, isResolved: true }),
  ]);
  return { total, resolved };
}

export function isOwnerOrAdmin(
  userId: string,
  role: string | undefined,
  authorId: string
): boolean {
  return userId === authorId || role === 'ADMIN';
}
