import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { CsvParserService } from './csv-parser.service';
import { TransactionMatcherService } from './transaction-matcher.service';

@Module({
  controllers: [FinanceController],
  providers: [FinanceService, CsvParserService, TransactionMatcherService],
})
export class FinanceModule {}
