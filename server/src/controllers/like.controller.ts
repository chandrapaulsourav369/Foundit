/**
 * Like Controller
 * 
 * Handles HTTP requests related to likes on posts including:
 * - Toggling likes (add/remove like)
 */

import { Response } from 'express';
import { AuthRequest } from '#src/types/authRequest.js';
import { sendApiError, sendApiSuccess } from '#src/utils/api-response.ts';
import { toggleLike } from '#src/services/like.service.ts';
import { findPostById } from '#src/services/post.service.ts';

/**
 * Toggle Like Handler
 * 
 * Toggles a like on a post. If the user has already liked the post, the like is removed.
 * If the user hasn't liked it, a new like is created.
 * 
 * @param req - Express request with authenticated user info and post ID in params
 * @param res - Express response object
 * @returns Like status object with liked state and total like count
 */
export const toggleLikeHandler = async (req: AuthRequest, res: Response) => {
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

    // Toggle the like for this user on this post
    const result = await toggleLike(req.params.id, req.userId);
    return sendApiSuccess(res, { data: result });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to update like' });
  }
};
