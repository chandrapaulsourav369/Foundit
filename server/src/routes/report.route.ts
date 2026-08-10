import { Router } from 'express';
import {
  createReportHandler,
  listMyReportsHandler,
} from '#src/controllers/report.controller.ts';
import { authMiddleware } from '#src/middlewares/authenticate.middleware.ts';

const router = Router();

router.use(authMiddleware);
router.post('/', createReportHandler);
router.get('/mine', listMyReportsHandler);

export default router;
