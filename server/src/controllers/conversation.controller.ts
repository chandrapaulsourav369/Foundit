import { Response } from 'express';
import { AuthRequest } from '#src/types/authRequest.js';
import { sendApiError, sendApiSuccess } from '#src/utils/api-response.ts';
import {
  CreateConversationSchema,
  CreateMessageSchema,
  ListMessagesQuerySchema,
} from '#src/validations/conversation.validation.ts';
import {
  createMessage,
  findOrCreateConversation,
  getConversationById,
  isParticipant,
  listConversationsForUser,
  listMessages,
  markConversationRead,
} from '#src/services/conversation.service.ts';
import { findPostById } from '#src/services/post.service.ts';
import { createNotification } from '#src/services/notification.service.ts';
import { NotificationType } from '#models/notification.model.ts';

export const createConversationHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.userId) {
      return sendApiError(res, { status: 401, message: 'Unauthorized' });
    }

    const parsed = CreateConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const post = await findPostById(parsed.data.postId);
    if (!post) {
      return sendApiError(res, { status: 404, message: 'Post not found' });
    }
    if (post.authorId === req.userId) {
      return sendApiError(res, {
        status: 400,
        message: 'You cannot message yourself about your own listing',
      });
    }

    const conversation = await findOrCreateConversation(
      post.id,
      req.userId,
      post.authorId
    );
    return sendApiSuccess(res, {
      status: 201,
      data: { conversation },
    });
  } catch (error) {
    return sendApiError(res, {
      status: 500,
      message: 'Failed to start conversation',
    });
  }
};

export const listConversationsHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const conversations = await listConversationsForUser(req.userId as string);
    return sendApiSuccess(res, { data: { conversations } });
  } catch (error) {
    return sendApiError(res, {
      status: 500,
      message: 'Failed to fetch conversations',
    });
  }
};

export const listMessagesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await getConversationById(req.params.id);
    if (!conversation) {
      return sendApiError(res, { status: 404, message: 'Conversation not found' });
    }
    if (!isParticipant(conversation, req.userId as string)) {
      return sendApiError(res, { status: 403, message: 'Forbidden' });
    }

    const parsed = ListMessagesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await listMessages(req.params.id, parsed.data);
    return sendApiSuccess(res, { data: result });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to fetch messages' });
  }
};

export const createMessageHandler = async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await getConversationById(req.params.id);
    if (!conversation) {
      return sendApiError(res, { status: 404, message: 'Conversation not found' });
    }
    if (!isParticipant(conversation, req.userId as string)) {
      return sendApiError(res, { status: 403, message: 'Forbidden' });
    }

    const parsed = CreateMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const message = await createMessage({
      conversationId: req.params.id,
      senderId: req.userId as string,
      body: parsed.data.body,
    });

    const recipientId = conversation.participants.find(
      p => p !== req.userId
    );
    if (recipientId) {
      await createNotification({
        userId: recipientId,
        type: NotificationType.NEW_MESSAGE,
        title: 'New message',
        body: parsed.data.body.slice(0, 140),
        link: `/messages/${conversation.id}`,
      });
    }

    return sendApiSuccess(res, { status: 201, data: { message } });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to send message' });
  }
};

export const markConversationReadHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const conversation = await getConversationById(req.params.id);
    if (!conversation) {
      return sendApiError(res, { status: 404, message: 'Conversation not found' });
    }
    if (!isParticipant(conversation, req.userId as string)) {
      return sendApiError(res, { status: 403, message: 'Forbidden' });
    }

    await markConversationRead(req.params.id, req.userId as string);
    return sendApiSuccess(res, { message: 'Conversation marked as read' });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to mark as read' });
  }
};
