import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockFindOne = jest.fn<any>();
const mockCreate = jest.fn<any>();
const mockDeleteOne = jest.fn<any>();
const mockCountDocuments = jest.fn<any>();

jest.unstable_mockModule('#models/like.model.ts', () => ({
  Like: {
    findOne: mockFindOne,
    create: mockCreate,
    deleteOne: mockDeleteOne,
    countDocuments: mockCountDocuments,
  },
}));

const { toggleLike } = await import('#src/services/like.service.ts');

describe('toggleLike', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('likes a post that has no existing like from this user', async () => {
    mockFindOne.mockResolvedValue(null);
    mockCountDocuments.mockResolvedValue(1);

    const result = await toggleLike('post-1', 'user-1');

    expect(mockCreate).toHaveBeenCalledWith({
      postId: 'post-1',
      userId: 'user-1',
    });
    expect(mockDeleteOne).not.toHaveBeenCalled();
    expect(result).toEqual({ liked: true, likeCount: 1 });
  });

  it('unlikes a post the user already liked', async () => {
    mockFindOne.mockResolvedValue({ id: 'like-1' });
    mockCountDocuments.mockResolvedValue(0);

    const result = await toggleLike('post-1', 'user-1');

    expect(mockDeleteOne).toHaveBeenCalledWith({ _id: 'like-1' });
    expect(mockCreate).not.toHaveBeenCalled();
    expect(result).toEqual({ liked: false, likeCount: 0 });
  });
});
