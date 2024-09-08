import { Module } from '@nestjs/common';

import { ConfigureModule } from './configure/configure.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [ConfigureModule, StockModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
