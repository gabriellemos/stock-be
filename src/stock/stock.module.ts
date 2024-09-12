import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SpreadsheetsModule } from '../spreadsheets/spreadsheets.module';
import { HistoryItem, HistoryItemSchema } from './entities/history-item.entity';
import { Stock, StockSchema } from './entities/stock.entity';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [
    SpreadsheetsModule,
    MongooseModule.forFeature([
      { name: HistoryItem.name, schema: HistoryItemSchema },
      { name: Stock.name, schema: StockSchema },
    ]),
  ],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}
