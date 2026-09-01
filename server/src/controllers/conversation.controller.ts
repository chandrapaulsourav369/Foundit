/**
 * Conversation Controller
 * 
 * Handles HTTP requests related to conversations and direct messaging between users including:
 * - Creating new conversations
 * - Listing user's conversations
 * - Listing messages in a conversation
 * - Sending messages
 * - Marking conversations as read
 */

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

/**
 * Create Conversation Handler
 * 
 * Initiates a new conversation between two users about a specific post
 * Prevents users from messaging themselves about their own posts
 * 
 * @param req - Express request with authenticated user info and post ID in body
 * @param res - Express response object
 * @returns Newly created or existing conversation object
 */
export const createConversationHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // Verify user is authenticated
    if (!req.userId) {
      return sendApiError(res, { status: 401, message: 'Unauthorized' });
    }

    // Validate request body against schema
    const parsed = CreateConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    // Verify the post exists
    const post = await findPostById(parsed.data.postId);
    if (!post) {
      return sendApiError(res, { status: 404, message: 'Post not found' });
    }
    
    // Prevent users from messaging themselves
    if (post.authorId === req.userId) {
      return sendApiError(res, {
        status: 400,
        message: 'You cannot message yourself about your own listing',
      });
    }

    // Create new conversation or retrieve existing one between these two users
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

/**
 * List Conversations Handler
 * 
 * Retrieves all conversations for the authenticated user, sorted by most recent message
 * 
 * @param req - Express request with authenticated user info
 * @param res - Express response object
 * @returns Array of conversation objects with latest message info
 */
export const listConversationsHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // Fetch all conversations for the current user
    const conversations = await listConversationsForUser(req.userId as string);
    return sendApiSuccess(res, { data: { conversations } });
  } catch (error) {
    return sendApiError(res, {
      status: 500,
      message: 'Failed to fetch conversations',
    });
  }
};

/**
 * List Messages Handler
 * 
 * Retrieves all messages in a conversation with pagination support
 * Only participants of the conversation can access its messages
 * 
 * @param req - Express request with authenticated user info, conversation ID in params, and pagination query
 * @param res - Express response object
 * @returns Paginated array of messages in the conversation
 */
export const listMessagesHandler = async (req: AuthRequest, res: Response) => {
  try {
    // Verify the conversation exists
    const conversation = await getConversationById(req.params.id);
    if (!conversation) {
      return sendApiError(res, { status: 404, message: 'Conversation not found' });
    }
    
    // Verify user is a participant in this conversation
    if (!isParticipant(conversation, req.userId as string)) {
      return sendApiError(res, { status: 403, message: 'Forbidden' });
    }

    // Validate query parameters for pagination
    const parsed = ListMessagesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    // Fetch messages with pagination
    const result = await listMessages(req.params.id, parsed.data);
    return sendApiSuccess(res, { data: result });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to fetch messages' });
  }
};

/**
 * Create Message Handler
 * 
 * Sends a new message in a conversation and notifies the recipient
 * Only conversation participants can send messages
 * 
 * @param req - Express request with authenticated user info, conversation ID, and message body
 * @param res - Express response object
 * @returns Newly created message object
 */
export const createMessageHandler = async (req: AuthRequest, res: Response) => {
  try {
    // Verify the conversation exists
    const conversation = await getConversationById(req.params.id);
    if (!conversation) {
      return sendApiError(res, { status: 404, message: 'Conversation not found' });
    }
    
    // Verify user is a participant in this conversation
    if (!isParticipant(conversation, req.userId as string)) {
      return sendApiError(res, { status: 403, message: 'Forbidden' });
    }

    // Validate message body against schema
    const parsed = CreateMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    // Create the message in database
    const message = await createMessage({
      conversationId: req.params.id,
      senderId: req.userId as string,
      body: parsed.data.body,
    });

    // Notify the other participant about the new message
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

/**
 * Mark Conversation Read Handler
 * 
 * Marks a conversation as read for the current user, indicating they've viewed all messages
 * Only conversation participants can mark it as read
 * 
 * @param req - Express request with authenticated user info and conversation ID in params
 * @param res - Express response object
 * @returns Success message
 */
export const markConversationReadHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // Verify the conversation exists
    const conversation = await getConversationById(req.params.id);
    if (!conversation) {
      return sendApiError(res, { status: 404, message: 'Conversation not found' });
    }
    
    // Verify user is a participant in this conversation
    if (!isParticipant(conversation, req.userId as string)) {
      return sendApiError(res, { status: 403, message: 'Forbidden' });
    }

    // Mark conversation as read for the current user
    await markConversationRead(req.params.id, req.userId as string);
    return sendApiSuccess(res, { message: 'Conversation marked as read' });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to mark as read' });
  }
};
