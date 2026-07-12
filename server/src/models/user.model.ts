import { Schema, model } from 'mongoose';
import { randomUUID } from 'node:crypto';

export const Gender = { MALE: 'MALE', FEMALE: 'FEMALE', UNISEX: 'UNISEX' } as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const Role = { USER: 'USER', ADMIN: 'ADMIN' } as const;
export type Role = (typeof Role)[keyof typeof Role];

export interface UserDocument {
  _id: string;
  id: string;
  email: string;
  passwordHash: string | null;
  name: string;
  avatarUrl: string | null;
  userBodyImageUrl: string | null;
  age: number | null;
  ethnicity: string | null;
  gender: Gender;
  interests: string[];
  location: string | null;
  role: Role;
  verificationToken: string | null;
  passwordResetTokenHash: string | null;
  passwordResetExpiresAt: Date | null;
  emailVerified: boolean;
  isActive: boolean;
  oauthProvider: string | null;
  oauthId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const userSchema = new Schema<UserDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, default: null },
    name: { type: String, required: true },
    avatarUrl: { type: String, default: null },
    userBodyImageUrl: { type: String, default: null },
    age: { type: Number, default: null },
    ethnicity: { type: String, default: null },
    gender: {
      type: String,
      enum: Object.values(Gender),
      default: Gender.UNISEX,
    },
    interests: { type: [String], default: [] },
    location: { type: String, default: null },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    verificationToken: { type: String, default: null },
    passwordResetTokenHash: { type: String, default: null, index: true },
    passwordResetExpiresAt: { type: Date, default: null },
    emailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    oauthProvider: { type: String, default: null },
    oauthId: { type: String, default: null },
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

userSchema.index({ role: 1 });
// Mirrors Prisma's @@unique([oauthProvider, oauthId]): Postgres treats NULL
// pairs as distinct, so only enforce uniqueness once both fields are set.
userSchema.index(
  { oauthProvider: 1, oauthId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      oauthProvider: { $type: 'string' },
      oauthId: { $type: 'string' },
    },
  }
);

export const User = model<UserDocument>('User', userSchema);
