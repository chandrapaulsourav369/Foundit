import { Response } from 'express';
import { AuthRequest } from '#src/types/authRequest.js';
import { sendApiError, sendApiSuccess } from '#src/utils/api-response.ts';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '#src/services/notification.service.ts';

export const listNotificationsHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const cursor =
      typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const limit = req.query.limit
      ? Math.min(50, Math.max(1, Number(req.query.limit) || 20))
      : 20;

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

export const markNotificationReadHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const updated = await markNotificationRead(
      req.params.id,
      req.userId as string
    );
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

export const markAllNotificationsReadHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    await markAllNotificationsRead(req.userId as string);
    return sendApiSuccess(res, { message: 'All notifications marked as read' });
  } catch (error) {
    return sendApiError(res, {
      status: 500,
      message: 'Failed to update notifications',
    });
  }
};
