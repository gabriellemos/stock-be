import { Module } from '@nestjs/common';

import { LogModule } from './log/log.module';
import { CommonModule } from './common/common.module';
import { ConfigureModule } from './configure/configure.module';
import { SpreadsheetsModule } from './spreadsheets/spreadsheets.module';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [
    LogModule,
    CommonModule,
    ConfigureModule,
    SpreadsheetsModule,
    StockModule,
  ],
})
export class AppModule {}
