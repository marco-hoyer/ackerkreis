import { db } from '@/lib/db';
import { sendMagicLinkEmail } from '@/lib/email';
import { createSession, setSessionCookie } from './session';

const MAGIC_LINK_EXPIRY_MINUTES = Number(process.env.MAGIC_LINK_EXPIRY_MINUTES) || 15;

export async function sendMagicLink(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase();

  // Check if user exists
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    // Don't reveal whether user exists
    return;
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Store magic link
  await db.magicLink.create({
    data: {
      email: normalizedEmail,
      code,
      expiresAt: new Date(Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000),
    },
  });

  // Send email
  await sendMagicLinkEmail(normalizedEmail, code);
}

export async function verifyMagicLink(email: string, code: string) {
  const normalizedEmail = email.toLowerCase();

  const magicLink = await db.magicLink.findFirst({
    where: {
      email: normalizedEmail,
      code,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!magicLink) {
    throw new Error('Ungueltiger oder abgelaufener Code');
  }

  // Mark as used
  await db.magicLink.update({
    where: { id: magicLink.id },
    data: { usedAt: new Date() },
  });

  // Get user
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    include: { subscription: true },
  });

  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }

  // Create session and set cookie
  const token = await createSession(user.id);
  await setSessionCookie(token);

  return user;
}
