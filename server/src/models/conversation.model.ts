/**
 * Conversation Model
 * 
 * Defines the MongoDB schema and interface for conversations between users
 * Conversations enable direct messaging between a post author and interested buyers/sellers
 */

import { Schema, model } from 'mongoose';
import { randomUUID } from 'node:crypto';

/**
 * ConversationDocument Interface
 * 
 * Represents the structure of a conversation document in MongoDB
 * 
 * @property _id - Unique identifier (UUID)
 * @property id - Public-facing unique identifier (virtual field, mirrors _id)
 * @property postId - Reference to the post being discussed (indexed for quick lookup)
 * @property participants - Array of exactly two user IDs involved in the conversation (validated)
 * @property lastMessageAt - Timestamp of the most recent message in conversation (used for sorting)
 * @property createdAt - Timestamp when conversation was created (auto-generated)
 * @property updatedAt - Timestamp when conversation was last updated (auto-generated)
 */
export interface ConversationDocument {
  _id: string;
  id: string;
  postId: string;
  participants: string[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Conversation Schema Definition
 * 
 * Configures the MongoDB schema with validation rules and transformations
 */
const conversationSchema = new Schema<ConversationDocument>(
  {
    // Unique identifier using UUID v4
    _id: { type: String, default: () => randomUUID() },
    // Reference to the post being discussed (indexed for efficient querying)
    postId: { type: String, required: true, index: true },
    // Two user IDs in the conversation (validated to be exactly 2)
    participants: {
      type: [String],
      required: true,
      validate: [
        (value: string[]) => value.length === 2,
        'A conversation must have exactly 2 participants',
      ],
    },
    // Timestamp tracking when the last message was sent (for sorting conversations)
    lastMessageAt: { type: Date, default: () => new Date() },
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

// Compound index for efficient retrieval of user's conversations sorted by recency
conversationSchema.index({ participants: 1, lastMessageAt: -1 });

/**
 * Conversation Model
 * 
 * MongoDB model for Conversation collection with full CRUD operations
 */
export const Conversation = model<ConversationDocument>(
  'Conversation',
  conversationSchema
);
