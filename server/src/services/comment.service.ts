import { Comment, CommentDocument } from '#models/comment.model.ts';
import { getPublicUserSummaries } from '#src/services/user.service.ts';

export type PublicComment = Omit<CommentDocument, '_id'> & {
  author: { id: string; name: string; avatarUrl: string | null } | null;
};

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

export async function createComment(data: {
  postId: string;
  authorId: string;
  body: string;
}): Promise<PublicComment> {
  const comment = await Comment.create(data);
  const author = await getPublicUserSummaries([data.authorId]);
  const { _id, ...rest } = comment.toObject();
  return { ...rest, author: author.get(data.authorId) ?? null };
}

export async function listCommentsByPost(
  postId: string,
  { cursor, limit = 20 }: { cursor?: string; limit?: number }
): Promise<{ comments: PublicComment[]; nextCursor: string | null }> {
  const filter: Record<string, unknown> = { postId };
  if (cursor) {
    const { createdAt, id } = decodeCursor(cursor);
    filter.$or = [
      { createdAt: { $gt: createdAt } },
      { createdAt, _id: { $gt: id } },
    ];
  }

  const docs = await Comment.find(filter)
    .sort({ createdAt: 1, _id: 1 })
    .limit(limit + 1);

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const last = page[page.length - 1];

  const authors = await getPublicUserSummaries(page.map(doc => doc.authorId));

  return {
    comments: page.map(doc => {
      const { _id, ...rest } = doc.toObject();
      return { ...rest, author: authors.get(doc.authorId) ?? null };
    }),
    nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
  };
}

export async function getCommentCounts(
  postIds: string[]
): Promise<Map<string, number>> {
  const uniqueIds = [...new Set(postIds)];
  if (uniqueIds.length === 0) return new Map();

  const counts = await Comment.aggregate<{ _id: string; count: number }>([
    { $match: { postId: { $in: uniqueIds } } },
    { $group: { _id: '$postId', count: { $sum: 1 } } },
  ]);

  return new Map(counts.map(c => [c._id, c.count]));
}

export async function findCommentById(id: string) {
  const comment = await Comment.findById(id);
  return comment ? comment.toObject() : null;
}

export async function deleteComment(id: string): Promise<void> {
  await Comment.deleteOne({ _id: id });
}
