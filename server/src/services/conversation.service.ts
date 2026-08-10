import { Conversation, ConversationDocument } from '#models/conversation.model.ts';
import { Message, MessageDocument } from '#models/message.model.ts';
import {
  getPublicUserSummaries,
  PublicUserSummary,
} from '#src/services/user.service.ts';

export type PublicMessage = Omit<MessageDocument, '_id'>;

export type ConversationSummary = Omit<ConversationDocument, '_id'> & {
  participant: PublicUserSummary | null;
  lastMessage: string | null;
  unreadCount: number;
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

// ponytail: find-then-create has a small race window under concurrent clicks;
// acceptable at this traffic level, add a unique index if duplicates show up.
export async function findOrCreateConversation(
  postId: string,
  userAId: string,
  userBId: string
) {
  const existing = await Conversation.findOne({
    postId,
    participants: { $all: [userAId, userBId] },
  });
  if (existing) return existing.toObject();

  const created = await Conversation.create({
    postId,
    participants: [userAId, userBId],
  });
  return created.toObject();
}

export async function getConversationById(id: string) {
  const conversation = await Conversation.findById(id);
  return conversation ? conversation.toObject() : null;
}

export async function listConversationsForUser(
  userId: string
): Promise<ConversationSummary[]> {
  const conversations = await Conversation.find({
    participants: userId,
  }).sort({ lastMessageAt: -1 });

  const otherIds = conversations.map(
    c => c.participants.find(p => p !== userId) ?? c.participants[0]
  );
  const summaries = await getPublicUserSummaries(otherIds);

  const lastMessages = await Message.aggregate([
    { $match: { conversationId: { $in: conversations.map(c => c.id) } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        body: { $first: '$body' },
      },
    },
  ]);
  const lastMessageByConvo = new Map(
    lastMessages.map(m => [m._id as string, m.body as string])
  );

  const unreadCounts = await Message.aggregate([
    {
      $match: {
        conversationId: { $in: conversations.map(c => c.id) },
        senderId: { $ne: userId },
        readBy: { $ne: userId },
      },
    },
    { $group: { _id: '$conversationId', count: { $sum: 1 } } },
  ]);
  const unreadByConvo = new Map(
    unreadCounts.map(u => [u._id as string, u.count as number])
  );

  return conversations.map((c, i) => {
    const { _id, ...rest } = c.toObject();
    return {
      ...rest,
      participant: summaries.get(otherIds[i]) ?? null,
      lastMessage: lastMessageByConvo.get(c.id) ?? null,
      unreadCount: unreadByConvo.get(c.id) ?? 0,
    };
  });
}

export async function listMessages(
  conversationId: string,
  { cursor, limit = 30 }: { cursor?: string; limit?: number }
): Promise<{ messages: PublicMessage[]; nextCursor: string | null }> {
  const filter: Record<string, unknown> = { conversationId };
  if (cursor) {
    const { createdAt, id } = decodeCursor(cursor);
    filter.$or = [
      { createdAt: { $gt: createdAt } },
      { createdAt, _id: { $gt: id } },
    ];
  }

  const docs = await Message.find(filter)
    .sort({ createdAt: 1, _id: 1 })
    .limit(limit + 1);

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const last = page[page.length - 1];

  return {
    messages: page.map(doc => {
      const { _id, ...rest } = doc.toObject();
      return rest;
    }),
    nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
  };
}

export async function createMessage(data: {
  conversationId: string;
  senderId: string;
  body: string;
}): Promise<PublicMessage> {
  const message = await Message.create({ ...data, readBy: [data.senderId] });
  await Conversation.updateOne(
    { _id: data.conversationId },
    { lastMessageAt: message.createdAt }
  );
  const { _id, ...rest } = message.toObject();
  return rest;
}

export async function markConversationRead(
  conversationId: string,
  userId: string
): Promise<void> {
  await Message.updateMany(
    { conversationId, senderId: { $ne: userId }, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );
}

export function isParticipant(
  conversation: { participants: string[] },
  userId: string
): boolean {
  return conversation.participants.includes(userId);
}
