import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { VotingService } from './voting.service';
import { VotingStatsService } from './voting-stats.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateVotingRoundDto } from './dto/create-voting-round.dto';
import { UpdateVotingRoundDto } from './dto/update-voting-round.dto';
import { SubmitVoteDto } from './dto/submit-vote.dto';

@Controller('voting')
@UseGuards(AuthGuard)
export class VotingController {
  constructor(
    private votingService: VotingService,
    private votingStatsService: VotingStatsService,
  ) {}

  @Get('rounds')
  async findAllRounds() {
    return this.votingService.findAllRounds();
  }

  @Get('rounds/:id')
  async findRound(@Param('id') id: string) {
    return this.votingService.findRound(id);
  }

  @Get('rounds/:id/stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getRoundStats(@Param('id') id: string) {
    return this.votingStatsService.calculateRoundStats(id);
  }

  @Get('current')
  async getCurrentRound() {
    return this.votingService.getCurrentRound();
  }

  @Post('rounds')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async createRound(@Body() dto: CreateVotingRoundDto) {
    return this.votingService.createRound(dto);
  }

  @Post('rounds/:id/open')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async openRound(@Param('id') id: string) {
    return this.votingService.openRound(id);
  }

  @Post('rounds/:id/close')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async closeRound(@Param('id') id: string) {
    return this.votingService.closeRound(id);
  }

  @Post('vote')
  async submitVote(@CurrentUser() user: any, @Body() dto: SubmitVoteDto) {
    if (!user.subscriptionId) {
      throw new Error('Kein Abonnement zugeordnet');
    }
    return this.votingService.submitVote(user.id, user.subscriptionId, dto);
  }

  @Get('my-vote/:roundId')
  async getMyVote(@CurrentUser() user: any, @Param('roundId') roundId: string) {
    return this.votingService.getMyVote(user.id, roundId);
  }
}
