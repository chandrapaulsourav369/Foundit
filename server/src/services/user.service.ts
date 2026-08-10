import { User, Gender } from '#models/user.model.ts';
import { Post } from '#models/post.model.ts';
import {
  CreateUserDto,
  ReturnUserDto,
  UpdateUserProfileDto,
} from '#src/types/user.js';
import { toPublicUser } from '#src/utils/auth/public-user.ts';

function toUserGender(gender: string): Gender | undefined {
  const normalizedGender = gender.trim().toUpperCase();

  if (normalizedGender === 'OTHER' || normalizedGender === 'UNSPECIFIED') {
    return Gender.UNISEX;
  }

  return (Gender as Record<string, Gender>)[normalizedGender];
}

export async function findUserByEmail(email: string) {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    return user ? user.toObject() : null;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function findUserById(id: string) {
  try {
    const user = await User.findById(id).select(
      'email name avatarUrl userBodyImageUrl bio age gender location interests passwordHash oauthProvider oauthId role emailVerified isActive deletedAt'
    );
    return user ? user.toObject() : null;
  } catch (err) {
    console.error('User Not Found:', err);
    throw err;
  }
}

export async function getUserBodyImageUrl(
  userId: string
): Promise<string | null> {
  try {
    const user = await User.findById(userId).select('userBodyImageUrl');
    return user?.userBodyImageUrl || null;
  } catch (err) {
    console.error('Error fetching user body image URL:', err);
    throw err;
  }
}

export async function createUser(data: CreateUserDto): Promise<ReturnUserDto> {
  try {
    const { email, name, passwordHash } = data;
    const user = await User.create({
      email: email.trim().toLowerCase(),
      name,
      passwordHash,
      verificationToken: data.verificationToken,
    });

    return toPublicUser(user.toObject());
  } catch (err) {
    console.error('Error in creating user:', err);
    throw err;
  }
}

export async function updateUserProfile(
  data: UpdateUserProfileDto
): Promise<ReturnUserDto> {
  try {
    const { userId, gender, ...updateData } = data;
    const userGender =
      typeof gender === 'string'
        ? toUserGender(gender) || (gender as Gender)
        : undefined;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...updateData,
        ...(userGender ? { gender: userGender } : {}),
      },
      { new: true }
    );
    if (!user) {
      throw new Error('User not found');
    }

    return toPublicUser(user.toObject());
  } catch (err) {
    console.error('Error in updating user profile:', err);
    throw err;
  }
}

export async function updateUserPassword(
  userId: string,
  newPasswordHash: string
) {
  try {
    const user = await User.findByIdAndUpdate(userId, {
      passwordHash: newPasswordHash,
    });
    if (!user) {
      throw new Error('User not found');
    }
  } catch (err) {
    console.error('Error in updating user password:', err);
    throw err;
  }
}

export async function verifyUserEmail(
  userId: string,
  verificationToken: string
) {
  try {
    const user = await User.findOneAndUpdate(
      { _id: userId, verificationToken },
      { emailVerified: true, isActive: true },
      { new: true }
    );
    if (!user) {
      throw new Error('User not found or invalid verification token');
    }
    return user.toObject() as ReturnUserDto;
  } catch (err) {
    console.error('Error in verifying email:', err);
    throw err;
  }
}

export async function findUserByVerificationToken(token: any) {
  try {
    const user = await User.findOne({
      verificationToken: token,
      deletedAt: null,
    });
    return user ? user.toObject() : null;
  } catch (error) {
    throw error;
  }
}

export type PublicUserSummary = {
  id: string;
  name: string;
  avatarUrl: string | null;
  location: string | null;
};

export async function getPublicUserSummaries(
  ids: string[]
): Promise<Map<string, PublicUserSummary>> {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return new Map();

  const users = await User.find({ _id: { $in: uniqueIds } }).select(
    'name avatarUrl location'
  );

  return new Map(
    users.map(user => [
      user.id,
      {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        location: user.location,
      },
    ])
  );
}

export async function getPublicUserSummary(
  id: string
): Promise<PublicUserSummary | null> {
  const summaries = await getPublicUserSummaries([id]);
  return summaries.get(id) ?? null;
}

export async function listUsersForAdmin(query: {
  search?: string;
  status?: 'ACTIVE' | 'BANNED';
  role?: 'USER' | 'ADMIN';
  cursor?: string;
  limit: number;
}) {
  const filter: Record<string, unknown> = {};
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }
  if (query.status) filter.isActive = query.status === 'ACTIVE';
  if (query.role) filter.role = query.role;
  if (query.cursor) {
    filter._id = { $lt: query.cursor };
  }

  const docs = await User.find(filter)
    .select('name email avatarUrl role isActive createdAt')
    .sort({ _id: -1 })
    .limit(query.limit + 1);

  const hasMore = docs.length > query.limit;
  const page = hasMore ? docs.slice(0, query.limit) : docs;
  const last = page[page.length - 1];

  return {
    users: page.map(u => u.toObject()),
    nextCursor: hasMore && last ? last.id : null,
  };
}

export async function countActiveUsers(): Promise<number> {
  return User.countDocuments({ deletedAt: null });
}

export async function setUserActive(userId: string, isActive: boolean) {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true }
  );
  if (!user) {
    throw new Error('User not found');
  }
  return user.toObject();
}

export async function getPublicProfile(userId: string) {
  const user = await User.findById(userId).select(
    'name avatarUrl bio location createdAt'
  );
  if (!user) return null;

  const [posts, found, resolved] = await Promise.all([
    Post.countDocuments({ authorId: userId, deletedAt: null }),
    Post.countDocuments({ authorId: userId, deletedAt: null, status: 'FOUND' }),
    Post.countDocuments({ authorId: userId, deletedAt: null, isResolved: true }),
  ]);

  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    location: user.location,
    joinedAt: user.createdAt,
    stats: { posts, found, resolved },
  };
}

export async function listUserPosts(
  userId: string,
  { cursor, limit = 20 }: { cursor?: string; limit?: number }
) {
  const filter: Record<string, unknown> = { authorId: userId, deletedAt: null };
  if (cursor) {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
    const separatorIndex = decoded.lastIndexOf('_');
    const createdAt = new Date(decoded.slice(0, separatorIndex));
    const id = decoded.slice(separatorIndex + 1);
    filter.$or = [
      { createdAt: { $lt: createdAt } },
      { createdAt, _id: { $lt: id } },
    ];
  }

  const docs = await Post.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1);

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const last = page[page.length - 1];

  return {
    posts: page.map(doc => {
      const { deletedAt, ...rest } = doc.toObject();
      return rest;
    }),
    nextCursor:
      hasMore && last
        ? Buffer.from(`${last.createdAt.toISOString()}_${last.id}`).toString(
            'base64url'
          )
        : null,
  };
}

export async function findUserByPasswordResetTokenHash(tokenHash: string) {
  try {
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
      deletedAt: null,
      isActive: true,
    });
    return user ? user.toObject() : null;
  } catch (error) {
    throw error;
  }
}
