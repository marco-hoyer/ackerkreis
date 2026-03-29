import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import type { User } from '@prisma/client';

const SESSION_COOKIE = 'session_token';
const SESSION_EXPIRY_DAYS = Number(process.env.SESSION_EXPIRY_DAYS) || 30;

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID();

  await db.authSession.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    path: '/',
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function validateSession(token: string): Promise<User | null> {
  const session = await db.authSession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return validateSession(token);
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Nicht angemeldet');
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== 'ADMIN') {
    throw new Error('Keine Berechtigung');
  }
  return user;
}

export async function invalidateSession(token: string): Promise<void> {
  await db.authSession.deleteMany({
    where: { token },
  });
}

export async function logout(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    await invalidateSession(token);
  }
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
