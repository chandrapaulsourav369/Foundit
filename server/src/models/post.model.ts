import { Schema, model } from 'mongoose';
import { randomUUID } from 'node:crypto';

export const Category = {
  PHONE: 'PHONE',
  WALLET: 'WALLET',
  ID_CARD: 'ID_CARD',
  PET: 'PET',
  KEYS: 'KEYS',
  ELECTRONICS: 'ELECTRONICS',
  BAG: 'BAG',
  DOCUMENT: 'DOCUMENT',
  CLOTHING: 'CLOTHING',
  OTHER: 'OTHER',
} as const;
export type Category = (typeof Category)[keyof typeof Category];

export const PostStatus = { LOST: 'LOST', FOUND: 'FOUND' } as const;
export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];

export interface PostImage {
  url: string;
  order: number;
}

export interface PostDocument {
  _id: string;
  id: string;
  title: string;
  description: string;
  category: Category;
  status: PostStatus;
  isResolved: boolean;
  resolvedAt: Date | null;
  location: string;
  itemDate: Date;
  images: PostImage[];
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const postImageSchema = new Schema<PostImage>(
  {
    url: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const postSchema = new Schema<PostDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    category: { type: String, enum: Object.values(Category), required: true },
    status: { type: String, enum: Object.values(PostStatus), required: true },
    isResolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
    location: { type: String, required: true, trim: true },
    itemDate: { type: Date, required: true },
    images: {
      type: [postImageSchema],
      default: [],
      validate: [
        (value: PostImage[]) => value.length <= 5,
        'A post can have at most 5 images',
      ],
    },
    authorId: { type: String, required: true, index: true },
    deletedAt: { type: Date, default: null, index: true },
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

postSchema.index({ title: 'text', description: 'text' });
postSchema.index({ category: 1 });
postSchema.index({ status: 1 });
postSchema.index({ isResolved: 1 });
postSchema.index({ createdAt: -1 });

export const Post = model<PostDocument>('Post', postSchema);
