import { Response } from 'express';
import { AuthRequest } from '#src/types/authRequest.js';
import { sendApiError, sendApiSuccess } from '#src/utils/api-response.ts';
import { toggleLike } from '#src/services/like.service.ts';
import { findPostById } from '#src/services/post.service.ts';

export const toggleLikeHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return sendApiError(res, { status: 401, message: 'Unauthorized' });
    }

    const post = await findPostById(req.params.id);
    if (!post) {
      return sendApiError(res, { status: 404, message: 'Post not found' });
    }

    const result = await toggleLike(req.params.id, req.userId);
    return sendApiSuccess(res, { data: result });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to update like' });
  }
};
