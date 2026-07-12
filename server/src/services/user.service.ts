import { User, Gender } from '#models/user.model.ts';
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
      'email name avatarUrl userBodyImageUrl age gender location interests passwordHash oauthProvider oauthId role emailVerified isActive deletedAt'
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
