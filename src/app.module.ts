import { Module } from '@nestjs/common';

import { ConfigureModule } from './configure/configure.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpreadsheetsModule } from './spreadsheets/spreadsheets.module';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [ConfigureModule, SpreadsheetsModule, StockModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
