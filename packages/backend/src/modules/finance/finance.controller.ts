import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('finance')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Post('import')
  async importCsv(@Body('csv') csvContent: string) {
    return this.financeService.importTransactions(csvContent);
  }

  @Get('transactions')
  async getTransactions(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('matched') matched?: string,
  ) {
    const matchedFilter = matched === 'true' ? true : matched === 'false' ? false : undefined;
    return this.financeService.getTransactions(+page, +limit, matchedFilter);
  }

  @Get('unmatched')
  async getUnmatchedTransactions(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.financeService.getUnmatchedTransactions(+page, +limit);
  }

  @Patch('transactions/:id/match')
  async manualMatch(
    @Param('id') id: string,
    @Body('subscriptionId') subscriptionId: string,
  ) {
    return this.financeService.manualMatch(id, subscriptionId);
  }

  @Get('statistics')
  async getStatistics(@Query('year') year?: string) {
    return this.financeService.getStatistics(year ? +year : undefined);
  }

  @Get('negative-balances')
  async getNegativeBalances() {
    return this.financeService.getNegativeBalances();
  }
}
