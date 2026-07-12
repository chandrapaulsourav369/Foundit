import { Response } from 'express';
import { AuthRequest } from '#src/types/authRequest.js';
import { sendApiError, sendApiSuccess } from '#src/utils/api-response.ts';
import {
  CreatePostSchema,
  ListPostsQuerySchema,
  UpdatePostSchema,
} from '#src/validations/post.validation.ts';
import {
  createPost,
  findPostById,
  isOwnerOrAdmin,
  listPosts,
  resolvePost,
  softDeletePost,
  updatePost,
} from '#src/services/post.service.ts';

export const createPostHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return sendApiError(res, { status: 401, message: 'Unauthorized' });
    }

    const parsed = CreatePostSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const post = await createPost({ ...parsed.data, authorId: req.userId });
    return sendApiSuccess(res, {
      status: 201,
      message: 'Post created successfully',
      data: { post },
    });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to create post' });
  }
};

export const listPostsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = ListPostsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await listPosts(parsed.data);
    return sendApiSuccess(res, { data: result });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to list posts' });
  }
};

export const getPostHandler = async (req: AuthRequest, res: Response) => {
  try {
    const post = await findPostById(req.params.id);
    if (!post) {
      return sendApiError(res, { status: 404, message: 'Post not found' });
    }
    return sendApiSuccess(res, { data: { post } });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to fetch post' });
  }
};

export const updatePostHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return sendApiError(res, { status: 401, message: 'Unauthorized' });
    }

    const existing = await findPostById(req.params.id);
    if (!existing) {
      return sendApiError(res, { status: 404, message: 'Post not found' });
    }
    if (!isOwnerOrAdmin(req.userId, req.role, existing.authorId)) {
      return sendApiError(res, { status: 403, message: 'Forbidden' });
    }

    const parsed = UpdatePostSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const post = await updatePost(req.params.id, parsed.data);
    return sendApiSuccess(res, {
      message: 'Post updated successfully',
      data: { post },
    });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to update post' });
  }
};

export const resolvePostHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return sendApiError(res, { status: 401, message: 'Unauthorized' });
    }

    const existing = await findPostById(req.params.id);
    if (!existing) {
      return sendApiError(res, { status: 404, message: 'Post not found' });
    }
    if (!isOwnerOrAdmin(req.userId, req.role, existing.authorId)) {
      return sendApiError(res, { status: 403, message: 'Forbidden' });
    }

    const isResolved = req.body?.isResolved !== false;
    const post = await resolvePost(req.params.id, isResolved);
    return sendApiSuccess(res, {
      message: 'Post resolution updated',
      data: { post },
    });
  } catch (error) {
    return sendApiError(res, {
      status: 500,
      message: 'Failed to update resolution',
    });
  }
};

export const deletePostHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return sendApiError(res, { status: 401, message: 'Unauthorized' });
    }

    const existing = await findPostById(req.params.id);
    if (!existing) {
      return sendApiError(res, { status: 404, message: 'Post not found' });
    }
    if (!isOwnerOrAdmin(req.userId, req.role, existing.authorId)) {
      return sendApiError(res, { status: 403, message: 'Forbidden' });
    }

    await softDeletePost(req.params.id);
    return sendApiSuccess(res, { message: 'Post deleted successfully' });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to delete post' });
  }
};
