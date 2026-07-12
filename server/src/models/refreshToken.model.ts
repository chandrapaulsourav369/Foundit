import { Schema, model } from 'mongoose';
import { randomUUID } from 'node:crypto';

export interface RefreshTokenDocument {
  _id: string;
  id: string;
  userId: string;
  token: string;
  sessionId: string;
  userAgent: string | null;
  ipAddress: string | null;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    sessionId: { type: String, required: true, unique: true },
    userAgent: { type: String, default: null },
    ipAddress: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ userId: 1, sessionId: 1, isActive: 1, expiresAt: 1 });

export const RefreshToken = model<RefreshTokenDocument>(
  'RefreshToken',
  refreshTokenSchema
);
