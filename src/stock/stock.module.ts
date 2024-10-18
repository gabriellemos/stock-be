import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LogModule } from 'src/log/log.module';

import { SpreadsheetsModule } from '../spreadsheets/spreadsheets.module';
import { HistoryItem, HistoryItemSchema } from './entities/history-item.entity';
import { Stock, StockSchema } from './entities/stock.entity';
import { StockController } from './stock.controller';
import { StockResolver } from './stock.resolver';
import { StockService } from './stock.service';

@Module({
  imports: [
    LogModule,
    SpreadsheetsModule,
    MongooseModule.forFeature([
      { name: HistoryItem.name, schema: HistoryItemSchema },
      { name: Stock.name, schema: StockSchema },
    ]),
  ],
  controllers: [StockController],
  providers: [StockResolver, StockService],
})
export class StockModule {}
