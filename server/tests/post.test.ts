import request from 'supertest';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockCreatePost = jest.fn<any>();
const mockListPosts = jest.fn<any>();
const mockFindPostById = jest.fn<any>();
const mockUpdatePost = jest.fn<any>();
const mockResolvePost = jest.fn<any>();
const mockSoftDeletePost = jest.fn<any>();

const mockVerifyAccessToken = jest.fn<any>();
const mockIsValidSession = jest.fn<any>();
const mockFindUserById = jest.fn<any>();

jest.unstable_mockModule('#src/config/google.config.ts', () => ({}));

jest.unstable_mockModule('#src/services/post.service.ts', () => ({
  createPost: mockCreatePost,
  listPosts: mockListPosts,
  findPostById: mockFindPostById,
  updatePost: mockUpdatePost,
  resolvePost: mockResolvePost,
  softDeletePost: mockSoftDeletePost,
  isOwnerOrAdmin: (
    userId: string,
    role: string | undefined,
    authorId: string
  ) => userId === authorId || role === 'ADMIN',
}));

jest.unstable_mockModule('#src/utils/jwt/tokens.ts', () => ({
  verifyAccessToken: mockVerifyAccessToken,
  generateTokens: jest.fn(),
  verifyRefreshToken: jest.fn(),
  hashTokenCrypto: jest.fn(),
  saveToCookie: jest.fn(),
  clearTokens: jest.fn(),
  createRandomToken: jest.fn(),
}));

jest.unstable_mockModule('#src/services/token.service.ts', () => ({
  isValidSession: mockIsValidSession,
  saveRefreshToken: jest.fn(),
  findAndRevokeRefreshToken: jest.fn(),
  deleteAllRefreshTokens: jest.fn(),
  deleteCurrentRefreshToken: jest.fn(),
  revokeSession: jest.fn(),
}));

jest.unstable_mockModule('#src/services/user.service.ts', () => ({
  findUserById: mockFindUserById,
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
  updateUserPassword: jest.fn(),
  findUserByVerificationToken: jest.fn(),
  findUserByPasswordResetTokenHash: jest.fn(),
  updateUserProfile: jest.fn(),
  verifyUserEmail: jest.fn(),
}));

jest.unstable_mockModule('passport', () => ({
  default: {
    initialize: () => (req: any, _res: any, next: any) => next(),
    session: () => (req: any, _res: any, next: any) => next(),
    authenticate: () => (req: any, _res: any, next: any) => next(),
  },
}));

const { default: app } = await import('#src/app.ts');

describe('Post routes', () => {
  const authHeader = { Authorization: 'Bearer access-1' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAccessToken.mockResolvedValue({
      userId: 'user-1',
      sessionId: 'session-1',
    });
    mockIsValidSession.mockResolvedValue(true);
    mockFindUserById.mockResolvedValue({
      id: 'user-1',
      role: 'USER',
      isActive: true,
    });
  });

  describe('POST /api/posts', () => {
    it('returns 401 when not authenticated', async () => {
      const response = await request(app).post('/api/posts').send({});
      expect(response.status).toBe(401);
    });

    it('returns 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set(authHeader)
        .send({});

      expect(response.status).toBe(400);
      expect(mockCreatePost).not.toHaveBeenCalled();
    });

    it('creates a post for the authenticated user', async () => {
      mockCreatePost.mockResolvedValue({ id: 'post-1', authorId: 'user-1' });

      const response = await request(app)
        .post('/api/posts')
        .set(authHeader)
        .send({
          title: 'Lost wallet',
          description: 'Black leather wallet near the library',
          category: 'WALLET',
          status: 'LOST',
          location: 'Main library',
          itemDate: '2026-07-01T00:00:00.000Z',
          images: [],
        });

      expect(response.status).toBe(201);
      expect(mockCreatePost).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Lost wallet', authorId: 'user-1' })
      );
    });
  });

  describe('GET /api/posts', () => {
    it('returns the feed without requiring auth', async () => {
      mockListPosts.mockResolvedValue({ posts: [], nextCursor: null });

      const response = await request(app).get('/api/posts');

      expect(response.status).toBe(200);
      expect(mockListPosts).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20 })
      );
    });

    it('rejects an invalid category filter', async () => {
      const response = await request(app).get('/api/posts?category=NOT_REAL');
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('returns 404 for a missing post', async () => {
      mockFindPostById.mockResolvedValue(null);
      const response = await request(app).get('/api/posts/missing');
      expect(response.status).toBe(404);
    });

    it('returns the post when found', async () => {
      mockFindPostById.mockResolvedValue({
        id: 'post-1',
        title: 'Lost wallet',
      });
      const response = await request(app).get('/api/posts/post-1');
      expect(response.status).toBe(200);
      expect(response.body.data.post).toEqual({
        id: 'post-1',
        title: 'Lost wallet',
      });
    });
  });

  describe('PATCH /api/posts/:id', () => {
    it('returns 403 when the requester does not own the post', async () => {
      mockFindPostById.mockResolvedValue({
        id: 'post-1',
        authorId: 'other-user',
      });

      const response = await request(app)
        .patch('/api/posts/post-1')
        .set(authHeader)
        .send({ title: 'Updated title' });

      expect(response.status).toBe(403);
      expect(mockUpdatePost).not.toHaveBeenCalled();
    });

    it('allows the owner to update their post', async () => {
      mockFindPostById.mockResolvedValue({
        id: 'post-1',
        authorId: 'user-1',
      });
      mockUpdatePost.mockResolvedValue({
        id: 'post-1',
        title: 'Updated title',
      });

      const response = await request(app)
        .patch('/api/posts/post-1')
        .set(authHeader)
        .send({ title: 'Updated title' });

      expect(response.status).toBe(200);
      expect(mockUpdatePost).toHaveBeenCalledWith('post-1', {
        title: 'Updated title',
      });
    });

    it("allows an admin to update someone else's post", async () => {
      mockFindUserById.mockResolvedValue({
        id: 'admin-1',
        role: 'ADMIN',
        isActive: true,
      });
      mockFindPostById.mockResolvedValue({
        id: 'post-1',
        authorId: 'other-user',
      });
      mockUpdatePost.mockResolvedValue({
        id: 'post-1',
        title: 'Updated title',
      });

      const response = await request(app)
        .patch('/api/posts/post-1')
        .set(authHeader)
        .send({ title: 'Updated title' });

      expect(response.status).toBe(200);
    });
  });

  describe('PATCH /api/posts/:id/resolve', () => {
    it('marks the post resolved for the owner', async () => {
      mockFindPostById.mockResolvedValue({
        id: 'post-1',
        authorId: 'user-1',
      });
      mockResolvePost.mockResolvedValue({ id: 'post-1', isResolved: true });

      const response = await request(app)
        .patch('/api/posts/post-1/resolve')
        .set(authHeader)
        .send({});

      expect(response.status).toBe(200);
      expect(mockResolvePost).toHaveBeenCalledWith('post-1', true);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('returns 403 for a non-owner, non-admin user', async () => {
      mockFindPostById.mockResolvedValue({
        id: 'post-1',
        authorId: 'other-user',
      });

      const response = await request(app)
        .delete('/api/posts/post-1')
        .set(authHeader);

      expect(response.status).toBe(403);
      expect(mockSoftDeletePost).not.toHaveBeenCalled();
    });

    it('deletes the post for the owner', async () => {
      mockFindPostById.mockResolvedValue({
        id: 'post-1',
        authorId: 'user-1',
      });
      mockSoftDeletePost.mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/posts/post-1')
        .set(authHeader);

      expect(response.status).toBe(200);
      expect(mockSoftDeletePost).toHaveBeenCalledWith('post-1');
    });
  });
});
