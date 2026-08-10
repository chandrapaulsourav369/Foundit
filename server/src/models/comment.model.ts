import { Schema, model } from 'mongoose';
import { randomUUID } from 'node:crypto';

export interface CommentDocument {
  _id: string;
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    postId: { type: String, required: true, index: true },
    authorId: { type: String, required: true, index: true },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
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

commentSchema.index({ postId: 1, createdAt: 1 });

export const Comment = model<CommentDocument>('Comment', commentSchema);
