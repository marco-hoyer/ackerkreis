'use server';

import { sendMagicLink, verifyMagicLink } from '@/lib/auth/magic-link';
import {
  startPasskeyRegistration,
  finishPasskeyRegistration,
  startPasskeyAuthentication,
  finishPasskeyAuthentication,
  getUserPasskeys,
  deletePasskey,
} from '@/lib/auth/passkey';
import { logout, requireUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/types';

export async function requestMagicLinkAction(email: string) {
  await sendMagicLink(email);
  return { success: true };
}

export async function verifyMagicLinkAction(email: string, code: string) {
  const user = await verifyMagicLink(email, code);
  return { success: true, user };
}

export async function logoutAction() {
  await logout();
  redirect('/login');
}

export async function startPasskeyRegistrationAction() {
  const user = await requireUser();
  return startPasskeyRegistration(user.id);
}

export async function finishPasskeyRegistrationAction(response: RegistrationResponseJSON) {
  const user = await requireUser();
  return finishPasskeyRegistration(user.id, response);
}

export async function startPasskeyAuthenticationAction(email?: string) {
  return startPasskeyAuthentication(email);
}

export async function finishPasskeyAuthenticationAction(
  response: AuthenticationResponseJSON,
  challengeKey: string
) {
  const user = await finishPasskeyAuthentication(response, challengeKey);
  return { success: true, user };
}

export async function getMyPasskeysAction() {
  const user = await requireUser();
  return getUserPasskeys(user.id);
}

export async function deletePasskeyAction(passkeyId: string) {
  const user = await requireUser();
  return deletePasskey(user.id, passkeyId);
}
