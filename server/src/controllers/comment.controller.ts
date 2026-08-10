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

export const listCommentsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = ListCommentsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await listCommentsByPost(req.params.id, parsed.data);
    return sendApiSuccess(res, { data: result });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to fetch comments' });
  }
};

export const createCommentHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return sendApiError(res, { status: 401, message: 'Unauthorized' });
    }

    const post = await findPostById(req.params.id);
    if (!post) {
      return sendApiError(res, { status: 404, message: 'Post not found' });
    }

    const parsed = CreateCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const comment = await createComment({
      postId: req.params.id,
      authorId: req.userId,
      body: parsed.data.body,
    });

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

export const deleteCommentHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return sendApiError(res, { status: 401, message: 'Unauthorized' });
    }

    const comment = await findCommentById(req.params.commentId);
    if (!comment || comment.postId !== req.params.id) {
      return sendApiError(res, { status: 404, message: 'Comment not found' });
    }
    if (!isOwnerOrAdmin(req.userId, req.role, comment.authorId)) {
      return sendApiError(res, { status: 403, message: 'Forbidden' });
    }

    await deleteComment(comment.id);
    return sendApiSuccess(res, { message: 'Comment deleted' });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to delete comment' });
  }
};
