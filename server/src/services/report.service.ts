import { Report, ReportDocument, ReportStatus } from '#models/report.model.ts';

export type PublicReport = Omit<ReportDocument, '_id'>;

function toPublicReport(doc: ReportDocument): PublicReport {
  const { _id, ...rest } = doc;
  return rest;
}

export async function hasOpenReport(
  postId: string,
  reporterId: string
): Promise<boolean> {
  const existing = await Report.findOne({
    postId,
    reporterId,
    status: { $in: [ReportStatus.PENDING, ReportStatus.REVIEWING] },
  });
  return Boolean(existing);
}

export async function countOpenReports(): Promise<number> {
  return Report.countDocuments({
    status: { $in: [ReportStatus.PENDING, ReportStatus.REVIEWING] },
  });
}

export async function createReport(data: {
  postId: string;
  reporterId: string;
  reason: string;
  details?: string;
}): Promise<PublicReport> {
  const report = await Report.create(data);
  return toPublicReport(report.toObject());
}

export async function listReportsByUser(
  reporterId: string
): Promise<PublicReport[]> {
  const reports = await Report.find({ reporterId }).sort({ createdAt: -1 });
  return reports.map(r => toPublicReport(r.toObject()));
}

export async function findReportById(id: string): Promise<PublicReport | null> {
  const report = await Report.findById(id);
  return report ? toPublicReport(report.toObject()) : null;
}

export async function listReportsForAdmin(query: {
  status?: string;
  reason?: string;
  cursor?: string;
  limit: number;
}): Promise<{ reports: PublicReport[]; nextCursor: string | null }> {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.reason) filter.reason = query.reason;
  if (query.cursor) {
    const decoded = Buffer.from(query.cursor, 'base64url').toString('utf-8');
    const separatorIndex = decoded.lastIndexOf('_');
    const createdAt = new Date(decoded.slice(0, separatorIndex));
    const id = decoded.slice(separatorIndex + 1);
    filter.$or = [
      { createdAt: { $lt: createdAt } },
      { createdAt, _id: { $lt: id } },
    ];
  }

  const docs = await Report.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(query.limit + 1);

  const hasMore = docs.length > query.limit;
  const page = hasMore ? docs.slice(0, query.limit) : docs;
  const last = page[page.length - 1];

  return {
    reports: page.map(doc => toPublicReport(doc.toObject())),
    nextCursor:
      hasMore && last
        ? Buffer.from(
            `${last.createdAt.toISOString()}_${last.id}`
          ).toString('base64url')
        : null,
  };
}

export async function updateReportStatus(
  id: string,
  data: { status?: string; adminResponse?: string }
): Promise<PublicReport | null> {
  const report = await Report.findByIdAndUpdate(id, data, { new: true });
  return report ? toPublicReport(report.toObject()) : null;
}
