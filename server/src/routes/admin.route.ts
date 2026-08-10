import { Router } from 'express';
import {
  adminListPostsHandler,
  adminListReportsHandler,
  adminListUsersHandler,
  adminRemovePostHandler,
  adminResolvePostHandler,
  adminRestorePostHandler,
  adminStatsHandler,
  adminUpdateReportHandler,
  adminUpdateUserStatusHandler,
} from '#src/controllers/admin.controller.ts';
import { authMiddleware } from '#src/middlewares/authenticate.middleware.ts';
import { requireRole } from '#src/middlewares/authorize.middleware.ts';

const router = Router();

router.use(authMiddleware, requireRole('ADMIN'));

router.get('/stats', adminStatsHandler);
router.get('/posts', adminListPostsHandler);
router.patch('/posts/:id/remove', adminRemovePostHandler);
router.patch('/posts/:id/restore', adminRestorePostHandler);
router.patch('/posts/:id/resolve', adminResolvePostHandler);

router.get('/users', adminListUsersHandler);
router.patch('/users/:id/status', adminUpdateUserStatusHandler);

router.get('/reports', adminListReportsHandler);
router.patch('/reports/:id', adminUpdateReportHandler);

export default router;
