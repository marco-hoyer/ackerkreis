import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { SessionService } from './session.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MagicLinkService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailService,
    private sessionService: SessionService,
  ) {}

  async sendMagicLink(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't reveal whether user exists
      return;
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryMinutes = this.configService.get<number>('MAGIC_LINK_EXPIRY_MINUTES') || 15;

    // Store magic link
    await this.prisma.magicLink.create({
      data: {
        email: normalizedEmail,
        code,
        expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
      },
    });

    // Send email
    await this.emailService.sendMagicLinkEmail(normalizedEmail, code);
  }

  async verifyCode(email: string, code: string): Promise<{ user: any; token: string }> {
    const normalizedEmail = email.toLowerCase();

    const magicLink = await this.prisma.magicLink.findFirst({
      where: {
        email: normalizedEmail,
        code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!magicLink) {
      throw new UnauthorizedException('Ungueltiger oder abgelaufener Code');
    }

    // Mark as used
    await this.prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { usedAt: new Date() },
    });

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { subscription: true },
    });

    if (!user) {
      throw new UnauthorizedException('Benutzer nicht gefunden');
    }

    // Create session
    const token = await this.sessionService.createSession(user.id);

    return { user, token };
  }
}
