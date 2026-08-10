import { Schema, model } from 'mongoose';
import { randomUUID } from 'node:crypto';

export interface LikeDocument {
  _id: string;
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema = new Schema<LikeDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    postId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
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

likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Like = model<LikeDocument>('Like', likeSchema);
