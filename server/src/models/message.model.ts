/**
 * Message Model
 * 
 * Defines the MongoDB schema and interface for messages within conversations
 * Messages enable direct communication between users in a conversation thread
 */

import { Schema, model } from 'mongoose';
import { randomUUID } from 'node:crypto';

/**
 * MessageDocument Interface
 * 
 * Represents the structure of a message document in MongoDB
 * 
 * @property _id - Unique identifier (UUID)
 * @property id - Public-facing unique identifier (virtual field, mirrors _id)
 * @property conversationId - Reference to the conversation this message belongs to (indexed for quick lookup)
 * @property senderId - Reference to the user who sent the message
 * @property body - Message content text (max 2000 characters)
 * @property readBy - Array of user IDs who have read this message
 * @property createdAt - Timestamp when message was created (auto-generated)
 * @property updatedAt - Timestamp when message was last updated (auto-generated)
 */
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

/**
 * Message Schema Definition
 * 
 * Configures the MongoDB schema with validation rules and transformations
 */
const messageSchema = new Schema<MessageDocument>(
  {
    // Unique identifier using UUID v4
    _id: { type: String, default: () => randomUUID() },
    // Reference to the conversation this message belongs to (indexed for efficient querying)
    conversationId: { type: String, required: true, index: true },
    // Reference to the user who sent the message
    senderId: { type: String, required: true },
    // Message content with length restriction and trimming
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    // Array of user IDs who have read this message (default empty, populated when message is read)
    readBy: { type: [String], default: [] },
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

// Compound index for efficient retrieval of messages by conversation sorted by creation date
messageSchema.index({ conversationId: 1, createdAt: 1 });

/**
 * Message Model
 * 
 * MongoDB model for Message collection with full CRUD operations
 */
export const Message = model<MessageDocument>('Message', messageSchema);
