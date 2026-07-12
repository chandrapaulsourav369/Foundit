import { User } from '#models/user.model.ts';

export async function CreateGoogleUser(profile: any) {
  try {
    const email = profile.emails?.[0]?.value?.trim().toLowerCase();
    if (!email) {
      throw new Error('Google profile email is missing');
    }

    const displayName = profile.displayName?.trim() || email.split('@')[0];
    const avatarUrl = profile.photos?.[0]?.value || undefined;
    const existingUser = await User.findOne({ email });

    const user = existingUser
      ? await User.findByIdAndUpdate(
          existingUser.id,
          {
            name: existingUser.name || displayName,
            ...(avatarUrl ? { avatarUrl } : {}),
            // Only keep a pre-existing password if the account was already
            // verified. Otherwise an attacker could pre-register the
            // victim's email with a password they control; once the real
            // owner signs in with Google (proving email ownership), that
            // attacker-set password must not survive onto the now-active account.
            passwordHash:
              existingUser.emailVerified && existingUser.passwordHash?.trim()
                ? existingUser.passwordHash
                : null,
            emailVerified: true,
            isActive: true,
            oauthProvider: 'google',
            oauthId: profile.id,
          },
          { new: true }
        )
      : await User.create({
          email,
          name: displayName,
          ...(avatarUrl ? { avatarUrl } : {}),
          passwordHash: null,
          isActive: true,
          emailVerified: true,
          oauthProvider: 'google',
          oauthId: profile.id,
        });

    return user!.toObject();
  } catch (err) {
    console.error('Error in creating user:', err);
    throw err;
  }
}
