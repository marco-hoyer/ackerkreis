import { db } from '@/lib/db';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/types';
import type { Passkey } from '@prisma/client';
import { createSession, setSessionCookie } from './session';

// In-memory challenge store (use Redis in production)
const challengeStore = new Map<string, string>();

const rpName = process.env.WEBAUTHN_RP_NAME || 'Solawi Manager';
const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const origin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

export async function startPasskeyRegistration(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { passkeys: true },
  });

  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }

  const existingPasskeys = user.passkeys.map((pk: Passkey) => ({
    id: pk.credentialId,
    transports: ['internal', 'hybrid'] as AuthenticatorTransportFuture[],
  }));

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new TextEncoder().encode(user.id),
    userName: user.email,
    userDisplayName: user.name,
    attestationType: 'none',
    excludeCredentials: existingPasskeys,
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  });

  challengeStore.set(user.id, options.challenge);

  return options;
}

export async function finishPasskeyRegistration(userId: string, response: RegistrationResponseJSON) {
  const expectedChallenge = challengeStore.get(userId);

  if (!expectedChallenge) {
    throw new Error('Keine Registrierung gestartet');
  }

  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new Error('Passkey-Registrierung fehlgeschlagen');
    }

    const { credential } = verification.registrationInfo;

    await db.passkey.create({
      data: {
        userId,
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey),
        counter: credential.counter,
      },
    });

    challengeStore.delete(userId);

    return { verified: true };
  } catch (error) {
    challengeStore.delete(userId);
    throw error;
  }
}

export async function startPasskeyAuthentication(email?: string) {
  let allowCredentials: { id: string; transports?: AuthenticatorTransportFuture[] }[] | undefined;

  if (email) {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { passkeys: true },
    });

    if (user && user.passkeys.length > 0) {
      allowCredentials = user.passkeys.map((pk: Passkey) => ({
        id: pk.credentialId,
        transports: ['internal', 'hybrid'] as AuthenticatorTransportFuture[],
      }));
    }
  }

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'preferred',
    allowCredentials,
  });

  const challengeKey = email ? `auth:${email.toLowerCase()}` : `auth:${options.challenge}`;
  challengeStore.set(challengeKey, options.challenge);

  return { options, challengeKey };
}

export async function finishPasskeyAuthentication(
  response: AuthenticationResponseJSON,
  challengeKey: string
) {
  const expectedChallenge = challengeStore.get(challengeKey);

  if (!expectedChallenge) {
    throw new Error('Keine Authentifizierung gestartet');
  }

  const passkey = await db.passkey.findUnique({
    where: { credentialId: response.id },
    include: { user: true },
  });

  if (!passkey) {
    challengeStore.delete(challengeKey);
    throw new Error('Passkey nicht gefunden');
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: passkey.credentialId,
        publicKey: passkey.publicKey,
        counter: passkey.counter,
      },
    });

    if (!verification.verified) {
      throw new Error('Passkey-Authentifizierung fehlgeschlagen');
    }

    await db.passkey.update({
      where: { id: passkey.id },
      data: { counter: verification.authenticationInfo.newCounter },
    });

    challengeStore.delete(challengeKey);

    // Create session and set cookie
    const token = await createSession(passkey.user.id);
    await setSessionCookie(token);

    return passkey.user;
  } catch (error) {
    challengeStore.delete(challengeKey);
    throw error;
  }
}

export async function getUserPasskeys(userId: string) {
  return db.passkey.findMany({
    where: { userId },
    select: {
      id: true,
      credentialId: true,
      createdAt: true,
    },
  });
}

export async function deletePasskey(userId: string, passkeyId: string) {
  const passkey = await db.passkey.findFirst({
    where: { id: passkeyId, userId },
  });

  if (!passkey) {
    throw new Error('Passkey nicht gefunden');
  }

  await db.passkey.delete({ where: { id: passkeyId } });
  return { message: 'Passkey geloescht' };
}
