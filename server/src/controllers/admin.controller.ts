import { Response } from 'express';
import { AuthRequest } from '#src/types/authRequest.js';
import { sendApiError, sendApiSuccess } from '#src/utils/api-response.ts';
import {
  AdminListPostsQuerySchema,
  AdminListReportsQuerySchema,
  AdminListUsersQuerySchema,
  UpdateReportSchema,
  UpdateUserStatusSchema,
} from '#src/validations/admin.validation.ts';
import {
  adminListPosts,
  countPostStats,
  findPostById,
  resolvePost,
  restorePost,
  softDeletePost,
} from '#src/services/post.service.ts';
import {
  countActiveUsers,
  findUserById,
  listUsersForAdmin,
  setUserActive,
} from '#src/services/user.service.ts';
import {
  countOpenReports,
  findReportById,
  listReportsForAdmin,
  updateReportStatus,
} from '#src/services/report.service.ts';
import { createNotification } from '#src/services/notification.service.ts';
import { NotificationType } from '#models/notification.model.ts';
import { ReportStatus } from '#models/report.model.ts';

export const adminStatsHandler = async (_req: AuthRequest, res: Response) => {
  try {
    const [postStats, totalUsers, openReports] = await Promise.all([
      countPostStats(),
      countActiveUsers(),
      countOpenReports(),
    ]);
    return sendApiSuccess(res, {
      data: {
        stats: {
          totalUsers,
          totalPosts: postStats.total,
          resolvedPosts: postStats.resolved,
          openReports,
        },
      },
    });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to fetch stats' });
  }
};

// --- Posts ---

export const adminListPostsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = AdminListPostsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    const result = await adminListPosts(
      parsed.data as Parameters<typeof adminListPosts>[0]
    );
    return sendApiSuccess(res, { data: result });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to fetch posts' });
  }
};

export const adminRemovePostHandler = async (req: AuthRequest, res: Response) => {
  try {
    const post = await findPostById(req.params.id);
    if (!post) {
      return sendApiError(res, { status: 404, message: 'Post not found' });
    }

    await softDeletePost(req.params.id);
    await createNotification({
      userId: post.authorId,
      type: NotificationType.MODERATION,
      title: 'Listing removed',
      body: `Your listing "${post.title}" was removed by a moderator.`,
      link: `/posts/${post.id}`,
    });
    return sendApiSuccess(res, { message: 'Post removed' });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to remove post' });
  }
};

export const adminRestorePostHandler = async (req: AuthRequest, res: Response) => {
  try {
    const post = await restorePost(req.params.id);
    return sendApiSuccess(res, { message: 'Post restored', data: { post } });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to restore post' });
  }
};

export const adminResolvePostHandler = async (req: AuthRequest, res: Response) => {
  try {
    const isResolved = req.body?.isResolved !== false;
    const post = await resolvePost(req.params.id, isResolved);
    return sendApiSuccess(res, { data: { post } });
  } catch (error) {
    return sendApiError(res, {
      status: 500,
      message: 'Failed to update resolution',
    });
  }
};

// --- Users ---

export const adminListUsersHandler = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = AdminListUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    const result = await listUsersForAdmin(
      parsed.data as Parameters<typeof listUsersForAdmin>[0]
    );
    return sendApiSuccess(res, { data: result });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to fetch users' });
  }
};

export const adminUpdateUserStatusHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const parsed = UpdateUserStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const targetId = req.params.id;
    if (targetId === req.userId) {
      return sendApiError(res, {
        status: 400,
        message: 'You cannot change your own status',
      });
    }

    const target = await findUserById(targetId);
    if (!target) {
      return sendApiError(res, { status: 404, message: 'User not found' });
    }
    if (target.role === 'ADMIN') {
      return sendApiError(res, {
        status: 403,
        message: 'Admins cannot ban other admins',
      });
    }

    const user = await setUserActive(
      targetId,
      parsed.data.status === 'ACTIVE'
    );
    return sendApiSuccess(res, {
      message: `User ${parsed.data.status === 'ACTIVE' ? 'reactivated' : 'banned'}`,
      data: { user },
    });
  } catch (error) {
    return sendApiError(res, {
      status: 500,
      message: 'Failed to update user status',
    });
  }
};

// --- Reports ---

export const adminListReportsHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const parsed = AdminListReportsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    const result = await listReportsForAdmin(
      parsed.data as Parameters<typeof listReportsForAdmin>[0]
    );
    return sendApiSuccess(res, { data: result });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to fetch reports' });
  }
};

export const adminUpdateReportHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const parsed = UpdateReportSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendApiError(res, {
        status: 400,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const existing = await findReportById(req.params.id);
    if (!existing) {
      return sendApiError(res, { status: 404, message: 'Report not found' });
    }

    const report = await updateReportStatus(req.params.id, parsed.data);

    if (
      parsed.data.status &&
      parsed.data.status !== existing.status &&
      (parsed.data.status === ReportStatus.RESOLVED ||
        parsed.data.status === ReportStatus.REJECTED)
    ) {
      await createNotification({
        userId: existing.reporterId,
        type: NotificationType.REPORT_UPDATE,
        title: 'Your report was reviewed',
        body:
          parsed.data.adminResponse ||
          `Your report status is now ${parsed.data.status.toLowerCase()}.`,
        link: '/reports',
      });
    }

    return sendApiSuccess(res, { data: { report } });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to update report' });
  }
};
