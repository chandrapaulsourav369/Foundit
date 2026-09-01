/**
 * Comment Model
 * 
 * Defines the MongoDB schema and interface for comments on posts
 * Comments allow users to discuss and provide feedback on listings
 */

import { Schema, model } from 'mongoose';
import { randomUUID } from 'node:crypto';

/**
 * CommentDocument Interface
 * 
 * Represents the structure of a comment document in MongoDB
 * 
 * @property _id - Unique identifier (UUID)
 * @property id - Public-facing unique identifier (virtual field, mirrors _id)
 * @property postId - Reference to the post being commented on (indexed for quick lookup)
 * @property authorId - Reference to the user who created the comment (indexed for filtering user's comments)
 * @property body - Comment text content (max 1000 characters)
 * @property createdAt - Timestamp when comment was created (auto-generated)
 * @property updatedAt - Timestamp when comment was last updated (auto-generated)
 */
export interface CommentDocument {
  _id: string;
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Comment Schema Definition
 * 
 * Configures the MongoDB schema with validation rules and transformations
 */
const commentSchema = new Schema<CommentDocument>(
  {
    // Unique identifier using UUID v4
    _id: { type: String, default: () => randomUUID() },
    // Reference to the post (indexed for efficient querying of comments per post)
    postId: { type: String, required: true, index: true },
    // Reference to the comment author (indexed for efficient filtering)
    authorId: { type: String, required: true, index: true },
    // Comment content with length restriction and trimming
    body: { type: String, required: true, trim: true, maxlength: 1000 },
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

// Compound index for efficient retrieval of comments by post sorted by creation date
commentSchema.index({ postId: 1, createdAt: 1 });

/**
 * Comment Model
 * 
 * MongoDB model for Comment collection with full CRUD operations
 */
export const Comment = model<CommentDocument>('Comment', commentSchema);
