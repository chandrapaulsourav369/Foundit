import { RefreshToken } from '#models/refreshToken.model.ts';

export async function saveRefreshToken(
  userId: string,
  refreshToken: string,
  sessionId: string,
  userAgent?: string,
  ipAddress?: string
) {
  try {
    await RefreshToken.create({
      userId,
      token: refreshToken,
      sessionId,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    });
  } catch (err) {
    console.error('Error in saving refresh token:', err);
    throw err;
  }
}

// Atomically finds an active, unexpired refresh token by hash and revokes it
// in the same operation. This both rejects reuse of already-rotated/expired
// tokens and closes the race where two concurrent refreshes could each read
// the token as valid before either one revoked it.
export async function findAndRevokeRefreshToken(token: string) {
  try {
    const refreshToken = await RefreshToken.findOneAndUpdate(
      { token, isActive: true, expiresAt: { $gt: new Date() } },
      { isActive: false }
    );
    return refreshToken ? refreshToken.toObject() : null;
  } catch (err) {
    console.error('Refresh Token Not Found:', err);
    throw err;
  }
}

export async function deleteAllRefreshTokens(userId: string) {
  try {
    await RefreshToken.deleteMany({ userId });
  } catch (err) {
    console.error('Error in deleting refresh token:', err);
    throw err;
  }
}

export async function deleteCurrentRefreshToken(sessionId: string) {
  try {
    await RefreshToken.deleteMany({ sessionId });
  } catch (err) {
    console.error('Error in deleting user refresh tokens:', err);
    throw err;
  }
}

export async function isValidSession(userId: string, sessionId: string) {
  try {
    const token = await RefreshToken.exists({
      userId,
      sessionId,
      expiresAt: { $gt: new Date() },
      isActive: true,
    });
    return !!token;
  } catch (err) {
    console.error('Error in validating session:', err);
    throw err;
  }
}

export async function revokeSession(userId: string, sessionId: string) {
  try {
    await RefreshToken.updateMany({ userId, sessionId }, { isActive: false });
  } catch (err) {
    console.error('Error in revoking session:', err);
    throw err;
  }
}
