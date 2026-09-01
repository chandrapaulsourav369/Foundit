import { Router } from 'express';
import {
  createConversationHandler,
  createMessageHandler,
  listConversationsHandler,
  listMessagesHandler,
  markConversationReadHandler,
} from '#src/controllers/conversation.controller.ts';
import { authMiddleware } from '#src/middlewares/authenticate.middleware.ts';

const router = Router();

router.use(authMiddleware);
router.post('/', createConversationHandler);
router.get('/', listConversationsHandler);
router.get('/:id/messages', listMessagesHandler);
router.post('/:id/messages', createMessageHandler);
router.patch('/:id/read', markConversationReadHandler);

export default router;

// router conversation update 
