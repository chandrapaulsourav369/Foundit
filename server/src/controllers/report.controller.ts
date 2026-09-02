import { Response } from 'express';
import { AuthRequest } from '#src/types/authRequest.js';
import { sendApiError, sendApiSuccess } from '#src/utils/api-response.ts';
import { CreateReportSchema } from '#src/validations/report.validation.ts';
import {
  createReport,
  hasOpenReport,
  listReportsByUser,
} from '#src/services/report.service.ts';
import { findPostById } from '#src/services/post.service.ts';

export const createReportHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return sendApiError(res, { status: 401, message: 'Unauthorized' });
    }

    const parsed = CreateReportSchema.safeParse(req.body);
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

    if (await hasOpenReport(parsed.data.postId, req.userId)) {
      return sendApiError(res, {
        status: 400,
        message: 'You already have an open report on this listing',
      });
    }

    const report = await createReport({
      postId: parsed.data.postId,
      reporterId: req.userId,
      reason: parsed.data.reason,
      details: parsed.data.details,
    });

    return sendApiSuccess(res, {
      status: 201,
      message: 'Report submitted',
      data: { report },
    });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to submit report' });
  }
};

export const listMyReportsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const reports = await listReportsByUser(req.userId as string);
    return sendApiSuccess(res, { data: { reports } });
  } catch (error) {
    return sendApiError(res, { status: 500, message: 'Failed to fetch reports' });
  }
};


//report control update