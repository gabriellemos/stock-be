import { Module } from '@nestjs/common';

import { CommonModule } from './common/common.module';
import { ConfigureModule } from './core/configure/configure.module';
import { AuthModule } from './core/auth/auth.module';
import { StockModule } from './project/stock/stock.module';

@Module({
  imports: [CommonModule, ConfigureModule, AuthModule, StockModule],
})
export class AppModule {}
