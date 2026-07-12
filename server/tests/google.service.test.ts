import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockFindOne = jest.fn<any>();
const mockFindByIdAndUpdate = jest.fn<any>();
const mockCreate = jest.fn<any>();

jest.unstable_mockModule('#models/user.model.ts', () => ({
  User: {
    findOne: mockFindOne,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    create: mockCreate,
  },
}));

const { CreateGoogleUser } = await import('#src/services/google.service.ts');

const baseProfile = {
  id: 'google-id-1',
  displayName: 'Victim Name',
  emails: [{ value: 'victim@example.com' }],
  photos: [{ value: 'https://example.com/photo.jpg' }],
};

describe('CreateGoogleUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('clears an attacker-set password when linking to an unverified account', async () => {
    mockFindOne.mockResolvedValue({
      id: 'user-1',
      name: null,
      passwordHash: 'attacker-controlled-hash',
      emailVerified: false,
    });
    mockFindByIdAndUpdate.mockResolvedValue({
      toObject: () => ({ id: 'user-1' }),
    });

    await CreateGoogleUser(baseProfile);

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ passwordHash: null }),
      { new: true }
    );
  });

  it('keeps the password when linking to an already-verified account', async () => {
    mockFindOne.mockResolvedValue({
      id: 'user-1',
      name: 'Victim Name',
      passwordHash: 'legitimate-hash',
      emailVerified: true,
    });
    mockFindByIdAndUpdate.mockResolvedValue({
      toObject: () => ({ id: 'user-1' }),
    });

    await CreateGoogleUser(baseProfile);

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ passwordHash: 'legitimate-hash' }),
      { new: true }
    );
  });
});
