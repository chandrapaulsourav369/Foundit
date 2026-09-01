/**
 * Notification Model
 * 
 * Defines the MongoDB schema and interface for user notifications
 * Notifications keep users informed about events like comments, messages, reports, and moderation actions
 */

import { Schema, model } from 'mongoose';
import { randomUUID } from 'node:crypto';

/**
 * NotificationType Enum
 * 
 * Defines all possible types of notifications that can be sent to users
 * 
 * - NEW_COMMENT: A new comment was posted on a user's listing
 * - NEW_MESSAGE: A user received a new direct message in a conversation
 * - REPORT_UPDATE: A report the user submitted or is involved with has been updated
 * - MODERATION: A moderation action (e.g., content warning, account restriction)
 */
export const NotificationType = {
  NEW_COMMENT: 'NEW_COMMENT',
  NEW_MESSAGE: 'NEW_MESSAGE',
  REPORT_UPDATE: 'REPORT_UPDATE',
  MODERATION: 'MODERATION',
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

/**
 * NotificationDocument Interface
 * 
 * Represents the structure of a notification document in MongoDB
 * 
 * @property _id - Unique identifier (UUID)
 * @property id - Public-facing unique identifier (virtual field, mirrors _id)
 * @property userId - Reference to the user who receives the notification (indexed for quick lookup)
 * @property type - Type of notification (enum: NEW_COMMENT, NEW_MESSAGE, REPORT_UPDATE, MODERATION)
 * @property title - Short title/subject of the notification
 * @property body - Detailed content/message of the notification
 * @property link - Optional URL or path the user can navigate to (e.g., post link, conversation link)
 * @property isRead - Boolean flag indicating if the user has read this notification
 * @property createdAt - Timestamp when notification was created (auto-generated)
 * @property updatedAt - Timestamp when notification was last updated (auto-generated)
 */
export interface NotificationDocument {
  _id: string;
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification Schema Definition
 * 
 * Configures the MongoDB schema with validation rules and transformations
 */
const notificationSchema = new Schema<NotificationDocument>(
  {
    // Unique identifier using UUID v4
    _id: { type: String, default: () => randomUUID() },
    // Reference to the user receiving the notification (indexed for efficient filtering)
    userId: { type: String, required: true, index: true },
    // Type of notification with enum validation to ensure valid notification types
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    // Short title/subject of the notification
    title: { type: String, required: true },
    // Detailed message content of the notification
    body: { type: String, required: true },
    // Optional link for the user to navigate to relevant content
    link: { type: String, default: null },
    // Flag indicating if the user has read this notification (default false)
    isRead: { type: Boolean, default: false },
  },
  {
    // Enable automatic timestamps (createdAt, updatedAt)
    timestamps: true,
    // Configure serialization to JavaScript objects
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        // Remove internal MongoDB ID from serialized output
        delete ret._id;
        return ret;
      },
    },
    // Configure serialization to JSON
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        // Remove internal MongoDB ID from JSON output
        delete ret._id;
        return ret;
      },
    },
  }
);

// Compound index for efficient retrieval of user's notifications sorted by creation date (most recent first)
notificationSchema.index({ userId: 1, createdAt: -1 });
// Index for efficient filtering of unread notifications by user
notificationSchema.index({ userId: 1, isRead: 1 });

/**
 * Notification Model
 * 
 * MongoDB model for Notification collection with full CRUD operations
 */
export const Notification = model<NotificationDocument>(
  'Notification',
  notificationSchema
);
