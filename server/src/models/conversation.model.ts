import { Schema, model } from 'mongoose';
import { randomUUID } from 'node:crypto';

export interface ConversationDocument {
  _id: string;
  id: string;
  postId: string;
  participants: string[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<ConversationDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    postId: { type: String, required: true, index: true },
    participants: {
      type: [String],
      required: true,
      validate: [
        (value: string[]) => value.length === 2,
        'A conversation must have exactly 2 participants',
      ],
    },
    lastMessageAt: { type: Date, default: () => new Date() },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

export const Conversation = model<ConversationDocument>(
  'Conversation',
  conversationSchema
);
