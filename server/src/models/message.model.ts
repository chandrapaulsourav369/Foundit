import { Schema, model } from 'mongoose';
import { randomUUID } from 'node:crypto';

export interface MessageDocument {
  _id: string;
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<MessageDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    conversationId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    readBy: { type: [String], default: [] },
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

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = model<MessageDocument>('Message', messageSchema);
