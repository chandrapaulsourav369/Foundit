import { Router } from 'express';
import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  listPostsHandler,
  resolvePostHandler,
  updatePostHandler,
} from '#src/controllers/post.controller.ts';
import { authMiddleware } from '#src/middlewares/authenticate.middleware.ts';

const router = Router();

router.get('/', listPostsHandler);
router.get('/:id', getPostHandler);
router.post('/', authMiddleware, createPostHandler);
router.patch('/:id', authMiddleware, updatePostHandler);
router.patch('/:id/resolve', authMiddleware, resolvePostHandler);
router.delete('/:id', authMiddleware, deletePostHandler);

export default router;
