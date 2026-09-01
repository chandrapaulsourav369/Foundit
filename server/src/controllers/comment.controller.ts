/**
 * Comment Controller
 * 
 * Handles HTTP requests related to comments on posts including:
 * - Listing comments for a specific post
 * - Creating new comments
 * - Deleting comments
 */

import { Response } from 'express';
import { AuthRequest } from '#src/types/authRequest.js';
import { sendApiError, sendApiSuccess } from '#src/utils/api-response.ts';
import {
  CreateCommentSchema,
  ListCommentsQuerySchema,
} from '#src/validations/comment.validation.ts';
import {
  createComment,
  deleteComment,
  findCommentById,
  listCommentsByPost,
} from '#src/services/comment.service.ts';
import { findPostById, isOwnerOrAdmin } from '#src/services/post.service.ts';
import { createNotification } from '#src/services/notification.service.ts';
import { NotificationType } from '#models/notification.model.ts';

/**
 * List Comments Handler
 * 
 * Retrieves all comments for a specific post with pagination support
 * 
 * @param req - Express request with authenticated user info and post ID in params
 * @param res - Express response object
 * @returns Array of comments with author details
 */
export const listCommentsHandler = async (req: AuthRequest, res: Response) => {
  try {
    // Validate query parameters against schema
    const parsed = ListCommentsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    // Fetch comments for the specified post with pagination
    const result = await listCommentsByPost(req.params.id, parsed.data);
    return sendApiSuccess(res, { data: result });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to fetch comments' });
  }
};

/**
 * Create Comment Handler
 * 
 * Creates a new comment on a post and notifies the post owner if they're not the commenter
 * 
 * @param req - Express request with authenticated user info, post ID, and comment body
 * @param res - Express response object
 * @returns Newly created comment object
 */
export const createCommentHandler = async (req: AuthRequest, res: Response) => {
  try {
    // Verify user is authenticated
    if (!req.userId) {
      return sendApiError(res, { status: 401, message: 'Unauthorized' });
    }

    // Verify the post exists
    const post = await findPostById(req.params.id);
    if (!post) {
      return sendApiError(res, { status: 404, message: 'Post not found' });
    }

    // Validate comment body against schema
    const parsed = CreateCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    // Create the comment in the database
    const comment = await createComment({
      postId: req.params.id,
      authorId: req.userId,
      body: parsed.data.body,
    });

    // Notify post owner about new comment (unless they're the commenter)
    if (post.authorId !== req.userId) {
      await createNotification({
        userId: post.authorId,
        type: NotificationType.NEW_COMMENT,
        title: 'New comment on your listing',
        body: `${comment.author?.name ?? 'Someone'} commented on "${post.title}"`,
        link: `/posts/${post.id}`,
      });
    }

    return sendApiSuccess(res, {
      status: 201,
      message: 'Comment posted',
      data: { comment },
    });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to post comment' });
  }
};

/**
 * Delete Comment Handler
 * 
 * Deletes a comment. Only the comment author or admin can delete it
 * 
 * @param req - Express request with authenticated user info, post ID, and comment ID
 * @param res - Express response object
 * @returns Success message
 */
export const deleteCommentHandler = async (req: AuthRequest, res: Response) => {
  try {
    // Verify user is authenticated
    if (!req.userId) {
      return sendApiError(res, { status: 401, message: 'Unauthorized' });
    }

    // Verify the comment exists and belongs to the specified post
    const comment = await findCommentById(req.params.commentId);
    if (!comment || comment.postId !== req.params.id) {
      return sendApiError(res, { status: 404, message: 'Comment not found' });
    }

    // Check if user is the comment author or an admin
    if (!isOwnerOrAdmin(req.userId, req.role, comment.authorId)) {
      return sendApiError(res, { status: 403, message: 'Forbidden' });
    }

    // Delete the comment from database
    await deleteComment(comment.id);
    return sendApiSuccess(res, { message: 'Comment deleted' });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to delete comment' });
  }
};
