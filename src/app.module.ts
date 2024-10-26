import { Module } from '@nestjs/common';

import { LogModule } from './core/log/log.module';
import { CommonModule } from './common/common.module';
import { ConfigureModule } from './core/configure/configure.module';
import { SpreadsheetsModule } from './project/spreadsheets/spreadsheets.module';
import { StockModule } from './project/stock/stock.module';

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
