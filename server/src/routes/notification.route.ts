import { Router } from 'express';
import {
  listNotificationsHandler,
  markAllNotificationsReadHandler,
  markNotificationReadHandler,
} from '#src/controllers/notification.controller.ts';
import { authMiddleware } from '#src/middlewares/authenticate.middleware.ts';

const router = Router();

router.use(authMiddleware);
router.get('/', listNotificationsHandler);
router.patch('/read-all', markAllNotificationsReadHandler);
router.patch('/:id/read', markNotificationReadHandler);

export default router;
