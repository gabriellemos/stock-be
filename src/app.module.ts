import { Module } from '@nestjs/common';

import { LogModule } from './core/log/log.module';
import { CommonModule } from './common/common.module';
import { ConfigureModule } from './core/configure/configure.module';
import { AuthModule } from './core/auth/auth.module';
import { SpreadsheetsModule } from './project/spreadsheets/spreadsheets.module';
import { StockModule } from './project/stock/stock.module';

@Module({
  imports: [
    LogModule,
    CommonModule,
    ConfigureModule,
    AuthModule,
    SpreadsheetsModule,
    StockModule,
  ],
})
export class AppModule {}
