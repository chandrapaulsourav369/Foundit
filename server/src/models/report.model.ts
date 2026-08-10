import { Schema, model } from 'mongoose';
import { randomUUID } from 'node:crypto';

export const ReportReason = {
  SPAM_DUPLICATE: 'SPAM_DUPLICATE',
  INAPPROPRIATE: 'INAPPROPRIATE',
  WRONG_CATEGORY: 'WRONG_CATEGORY',
  SUSPECTED_SCAM: 'SUSPECTED_SCAM',
  OTHER: 'OTHER',
} as const;
export type ReportReason = (typeof ReportReason)[keyof typeof ReportReason];

export const ReportStatus = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export interface ReportDocument {
  _id: string;
  id: string;
  postId: string;
  reporterId: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  adminResponse: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<ReportDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    postId: { type: String, required: true, index: true },
    reporterId: { type: String, required: true, index: true },
    reason: { type: String, enum: Object.values(ReportReason), required: true },
    details: { type: String, default: null, maxlength: 1000 },
    status: {
      type: String,
      enum: Object.values(ReportStatus),
      default: ReportStatus.PENDING,
    },
    adminResponse: { type: String, default: null },
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

reportSchema.index({ status: 1, createdAt: -1 });

export const Report = model<ReportDocument>('Report', reportSchema);
