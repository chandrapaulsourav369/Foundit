/**
 * Like Model
 * 
 * Defines the MongoDB schema and interface for likes on posts
 * Allows users to express appreciation for listings
 */

import { Schema, model } from 'mongoose';
import { randomUUID } from 'node:crypto';

/**
 * LikeDocument Interface
 * 
 * Represents the structure of a like document in MongoDB
 * 
 * @property _id - Unique identifier (UUID)
 * @property id - Public-facing unique identifier (virtual field, mirrors _id)
 * @property postId - Reference to the liked post (indexed for quick lookup)
 * @property userId - Reference to the user who liked the post (indexed for filtering user's likes)
 * @property createdAt - Timestamp when like was created (auto-generated)
 * @property updatedAt - Timestamp when like was last updated (auto-generated)
 */
export interface LikeDocument {
  _id: string;
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Like Schema Definition
 * 
 * Configures the MongoDB schema with validation rules and transformations
 */
const likeSchema = new Schema<LikeDocument>(
  {
    // Unique identifier using UUID v4
    _id: { type: String, default: () => randomUUID() },
    // Reference to the liked post (indexed for efficient querying of likes per post)
    postId: { type: String, required: true, index: true },
    // Reference to the user who liked the post (indexed for efficient filtering)
    userId: { type: String, required: true, index: true },
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

// Compound unique index to prevent duplicate likes (one like per user per post)
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

/**
 * Like Model
 * 
 * MongoDB model for Like collection with full CRUD operations
 */
export const Like = model<LikeDocument>('Like', likeSchema);
