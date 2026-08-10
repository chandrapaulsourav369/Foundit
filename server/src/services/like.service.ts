import { Like } from '#models/like.model.ts';

export type LikeData = { likeCount: number; likedByMe: boolean };

export async function toggleLike(
  postId: string,
  userId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const existing = await Like.findOne({ postId, userId });

  if (existing) {
    await Like.deleteOne({ _id: existing.id });
  } else {
    // unique postId+userId index guards against a duplicate race
    await Like.create({ postId, userId });
  }

  const likeCount = await Like.countDocuments({ postId });
  return { liked: !existing, likeCount };
}

export async function getLikeData(
  postIds: string[],
  userId?: string
): Promise<Map<string, LikeData>> {
  const uniqueIds = [...new Set(postIds)];
  if (uniqueIds.length === 0) return new Map();

  const [counts, likedByMeIds] = await Promise.all([
    Like.aggregate<{ _id: string; count: number }>([
      { $match: { postId: { $in: uniqueIds } } },
      { $group: { _id: '$postId', count: { $sum: 1 } } },
    ]),
    userId
      ? Like.find({ postId: { $in: uniqueIds }, userId }).distinct('postId')
      : Promise.resolve<string[]>([]),
  ]);

  const likedSet = new Set(likedByMeIds);
  const countMap = new Map(counts.map(c => [c._id, c.count]));

  return new Map(
    uniqueIds.map(id => [
      id,
      { likeCount: countMap.get(id) ?? 0, likedByMe: likedSet.has(id) },
    ])
  );
}
