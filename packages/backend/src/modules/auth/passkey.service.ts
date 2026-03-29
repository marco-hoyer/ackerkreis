import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';

// In-memory challenge store (use Redis in production)
const challengeStore = new Map<string, string>();

// Helper functions for base64url encoding/decoding
function base64UrlToBuffer(base64url: string): Uint8Array {
  return Buffer.from(base64url, 'base64url');
}

function bufferToBase64Url(buffer: Uint8Array): string {
  return Buffer.from(buffer).toString('base64url');
}

@Injectable()
export class PasskeyService {
  private rpName: string;
  private rpID: string;
  private origin: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.rpName = this.configService.get('WEBAUTHN_RP_NAME') || 'Solawi Manager';
    this.rpID = this.configService.get('WEBAUTHN_RP_ID') || 'localhost';
    this.origin = this.configService.get('WEBAUTHN_ORIGIN') || 'http://localhost:3000';
  }

  async startRegistration(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { passkeys: true },
    });

    if (!user) {
      throw new BadRequestException('Benutzer nicht gefunden');
    }

    const existingPasskeys = user.passkeys.map((pk) => ({
      id: base64UrlToBuffer(pk.credentialId),
      type: 'public-key' as const,
      transports: ['internal', 'hybrid'] as AuthenticatorTransport[],
    }));

    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpID,
      userID: user.id,
      userName: user.email,
      userDisplayName: user.name,
      attestationType: 'none',
      excludeCredentials: existingPasskeys,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    // Store challenge
    challengeStore.set(user.id, options.challenge);

    return options;
  }

  async finishRegistration(userId: string, response: RegistrationResponseJSON) {
    const expectedChallenge = challengeStore.get(userId);

    if (!expectedChallenge) {
      throw new BadRequestException('Keine Registrierung gestartet');
    }

    try {
      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
      });

      if (!verification.verified || !verification.registrationInfo) {
        throw new BadRequestException('Passkey-Registrierung fehlgeschlagen');
      }

      const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

      // Store passkey - convert Uint8Array to base64url string for storage
      await this.prisma.passkey.create({
        data: {
          userId,
          credentialId: bufferToBase64Url(credentialID),
          publicKey: Buffer.from(credentialPublicKey),
          counter,
        },
      });

      challengeStore.delete(userId);

      return { verified: true };
    } catch (error) {
      challengeStore.delete(userId);
      throw new BadRequestException('Passkey-Registrierung fehlgeschlagen: ' + error.message);
    }
  }

  async startAuthentication(email?: string) {
    let allowCredentials: { id: Uint8Array; type: 'public-key'; transports?: AuthenticatorTransport[] }[] | undefined;

    if (email) {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { passkeys: true },
      });

      if (user && user.passkeys.length > 0) {
        allowCredentials = user.passkeys.map((pk) => ({
          id: base64UrlToBuffer(pk.credentialId),
          type: 'public-key' as const,
          transports: ['internal', 'hybrid'] as AuthenticatorTransport[],
        }));
      }
    }

    const options = await generateAuthenticationOptions({
      rpID: this.rpID,
      userVerification: 'preferred',
      allowCredentials,
    });

    // Store challenge with a temporary key
    const challengeKey = email ? `auth:${email.toLowerCase()}` : `auth:${options.challenge}`;
    challengeStore.set(challengeKey, options.challenge);

    return { options, challengeKey };
  }

  async finishAuthentication(response: AuthenticationResponseJSON, challengeKey: string) {
    const expectedChallenge = challengeStore.get(challengeKey);

    if (!expectedChallenge) {
      throw new UnauthorizedException('Keine Authentifizierung gestartet');
    }

    // Find passkey by credential ID
    const passkey = await this.prisma.passkey.findUnique({
      where: { credentialId: response.id },
      include: { user: true },
    });

    if (!passkey) {
      challengeStore.delete(challengeKey);
      throw new UnauthorizedException('Passkey nicht gefunden');
    }

    try {
      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        authenticator: {
          credentialID: base64UrlToBuffer(passkey.credentialId),
          credentialPublicKey: passkey.publicKey,
          counter: passkey.counter,
        },
      });

      if (!verification.verified) {
        throw new UnauthorizedException('Passkey-Authentifizierung fehlgeschlagen');
      }

      // Update counter
      await this.prisma.passkey.update({
        where: { id: passkey.id },
        data: { counter: verification.authenticationInfo.newCounter },
      });

      challengeStore.delete(challengeKey);

      return passkey.user;
    } catch (error) {
      challengeStore.delete(challengeKey);
      throw new UnauthorizedException('Passkey-Authentifizierung fehlgeschlagen: ' + error.message);
    }
  }

  async getUserPasskeys(userId: string) {
    return this.prisma.passkey.findMany({
      where: { userId },
      select: {
        id: true,
        credentialId: true,
        createdAt: true,
      },
    });
  }

  async deletePasskey(userId: string, passkeyId: string) {
    const passkey = await this.prisma.passkey.findFirst({
      where: { id: passkeyId, userId },
    });

    if (!passkey) {
      throw new BadRequestException('Passkey nicht gefunden');
    }

    await this.prisma.passkey.delete({ where: { id: passkeyId } });
    return { message: 'Passkey geloescht' };
  }
}
