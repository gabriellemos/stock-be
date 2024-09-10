import { Module } from '@nestjs/common';

import { SpreadsheetsModule } from '../spreadsheets/spreadsheets.module';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [SpreadsheetsModule],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}
