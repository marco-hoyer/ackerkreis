import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MagicLinkService } from './magic-link.service';
import { SessionService } from './session.service';
import { PasskeyService } from './passkey.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [AuthController],
  providers: [AuthService, MagicLinkService, SessionService, PasskeyService],
  exports: [AuthService, SessionService],
})
export class AuthModule {}
