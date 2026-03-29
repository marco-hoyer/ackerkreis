import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async createSession(userId: string): Promise<string> {
    const token = uuidv4();
    const expiryDays = this.configService.get<number>('SESSION_EXPIRY_DAYS') || 30;

    await this.prisma.authSession.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
      },
    });

    return token;
  }

  async validateSession(token: string) {
    const session = await this.prisma.authSession.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  }

  async invalidateSession(token: string): Promise<void> {
    await this.prisma.authSession.deleteMany({
      where: { token },
    });
  }

  async invalidateUserSessions(userId: string): Promise<void> {
    await this.prisma.authSession.deleteMany({
      where: { userId },
    });
  }
}
