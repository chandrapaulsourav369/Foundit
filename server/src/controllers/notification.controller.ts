/**
 * Notification Controller
 * 
 * Handles HTTP requests related to user notifications including:
 * - Listing user notifications with cursor-based pagination
 * - Marking individual notifications as read
 * - Marking all notifications as read
 */

import { Response } from 'express';
import { AuthRequest } from '#src/types/authRequest.js';
import { sendApiError, sendApiSuccess } from '#src/utils/api-response.ts';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '#src/services/notification.service.ts';

/**
 * List Notifications Handler
 * 
 * Retrieves paginated notifications for the authenticated user
 * Supports cursor-based pagination and custom limit (max 50, default 20)
 * 
 * @param req - Express request with authenticated user info and optional cursor/limit query params
 * @param res - Express response object
 * @returns Paginated array of notification objects with pagination cursor
 */
export const listNotificationsHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // Extract cursor parameter for pagination (if provided as string query param)
    const cursor =
      typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    // Extract and validate limit parameter with bounds checking (min 1, max 50, default 20)
    const limit = req.query.limit
      ? Math.min(50, Math.max(1, Number(req.query.limit) || 20))
      : 20;

    // Fetch paginated notifications for the current user
    const result = await listNotifications(req.userId as string, {
      cursor,
      limit,
    });
    return sendApiSuccess(res, { data: result });
  } catch (error) {
    return sendApiError(res, {
      status: 500,
      message: 'Failed to fetch notifications',
    });
  }
};

/**
 * Mark Notification Read Handler
 * 
 * Marks a specific notification as read for the authenticated user
 * Only the notification owner can mark it as read
 * 
 * @param req - Express request with authenticated user info and notification ID in params
 * @param res - Express response object
 * @returns Success message if notification was marked as read, 404 if not found
 */
export const markNotificationReadHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // Mark the specific notification as read for the current user
    const updated = await markNotificationRead(
      req.params.id,
      req.userId as string
    );
    // Return 404 if notification doesn't exist or doesn't belong to user
    if (!updated) {
      return sendApiError(res, { status: 404, message: 'Notification not found' });
    }
    return sendApiSuccess(res, { message: 'Notification marked as read' });
  } catch (error) {
    return sendApiError(res, {
      status: 500,
      message: 'Failed to update notification',
    });
  }
};

/**
 * Mark All Notifications Read Handler
 * 
 * Marks all notifications as read for the authenticated user
 * Bulk operation for marking multiple unread notifications at once
 * 
 * @param req - Express request with authenticated user info
 * @param res - Express response object
 * @returns Success message
 */
export const markAllNotificationsReadHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // Mark all notifications as read for the current user
    await markAllNotificationsRead(req.userId as string);
    return sendApiSuccess(res, { message: 'All notifications marked as read' });
  } catch (error) {
    return sendApiError(res, {
      status: 500,
      message: 'Failed to update notifications',
    });
  }
};
