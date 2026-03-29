import { Controller, Post, Body, Get, Delete, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { MagicLinkService } from './magic-link.service';
import { SessionService } from './session.service';
import { PasskeyService } from './passkey.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestMagicLinkDto } from './dto/request-magic-link.dto';
import { VerifyMagicLinkDto } from './dto/verify-magic-link.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private magicLinkService: MagicLinkService,
    private sessionService: SessionService,
    private passkeyService: PasskeyService,
  ) {}

  @Post('magic-link/request')
  async requestMagicLink(@Body() dto: RequestMagicLinkDto) {
    await this.magicLinkService.sendMagicLink(dto.email);
    return { message: 'Falls ein Konto existiert, wurde ein Login-Code gesendet.' };
  }

  @Post('magic-link/verify')
  async verifyMagicLink(@Body() dto: VerifyMagicLinkDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.magicLinkService.verifyCode(dto.email, dto.code);

    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return { user };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getCurrentUser(@CurrentUser() user: any) {
    return { user };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {
    await this.sessionService.invalidateUserSessions(user.id);
    res.clearCookie('session');
    return { message: 'Erfolgreich abgemeldet' };
  }

  // Passkey Registration (requires authentication)
  @Post('passkey/register/start')
  @UseGuards(AuthGuard)
  async startPasskeyRegistration(@CurrentUser() user: any) {
    return this.passkeyService.startRegistration(user.id);
  }

  @Post('passkey/register/finish')
  @UseGuards(AuthGuard)
  async finishPasskeyRegistration(@CurrentUser() user: any, @Body() body: any) {
    return this.passkeyService.finishRegistration(user.id, body);
  }

  // Passkey Authentication (public)
  @Post('passkey/login/start')
  async startPasskeyLogin(@Body('email') email?: string) {
    const { options, challengeKey } = await this.passkeyService.startAuthentication(email);
    return { options, challengeKey };
  }

  @Post('passkey/login/finish')
  async finishPasskeyLogin(
    @Body('response') response: any,
    @Body('challengeKey') challengeKey: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.passkeyService.finishAuthentication(response, challengeKey);
    const token = await this.sessionService.createSession(user.id);

    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { user };
  }

  // Manage passkeys
  @Get('passkeys')
  @UseGuards(AuthGuard)
  async getPasskeys(@CurrentUser() user: any) {
    return this.passkeyService.getUserPasskeys(user.id);
  }

  @Delete('passkeys/:id')
  @UseGuards(AuthGuard)
  async deletePasskey(@CurrentUser() user: any, @Param('id') passkeyId: string) {
    return this.passkeyService.deletePasskey(user.id, passkeyId);
  }
}
