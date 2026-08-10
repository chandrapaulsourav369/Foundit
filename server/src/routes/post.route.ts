import { Router } from 'express';
import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  listPostsHandler,
  resolvePostHandler,
  updatePostHandler,
} from '#src/controllers/post.controller.ts';
import {
  createCommentHandler,
  deleteCommentHandler,
  listCommentsHandler,
} from '#src/controllers/comment.controller.ts';
import { toggleLikeHandler } from '#src/controllers/like.controller.ts';
import {
  authMiddleware,
  optionalAuthMiddleware,
} from '#src/middlewares/authenticate.middleware.ts';

const router = Router();

router.get('/', optionalAuthMiddleware, listPostsHandler);
router.get('/:id', optionalAuthMiddleware, getPostHandler);
router.post('/', authMiddleware, createPostHandler);
router.patch('/:id', authMiddleware, updatePostHandler);
router.patch('/:id/resolve', authMiddleware, resolvePostHandler);
router.delete('/:id', authMiddleware, deletePostHandler);

router.post('/:id/like', authMiddleware, toggleLikeHandler);

router.get('/:id/comments', listCommentsHandler);
router.post('/:id/comments', authMiddleware, createCommentHandler);
router.delete('/:id/comments/:commentId', authMiddleware, deleteCommentHandler);

export default router;
