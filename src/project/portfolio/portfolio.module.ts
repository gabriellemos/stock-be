import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LogModule } from 'src/core/log/log.module';
import { UsersModule } from 'src/core/users/users.module';

import { Entry, EntrySchema } from './entities/entry.entity';
import { Portfolio, PortfolioSchema } from './entities/portfolio.entity';
import { Position, PositionSchema } from './entities/position.entity';
import { OrderTypeScalar } from './scalars/order-type.scalar';
import { PortfolioResolver } from './portfolio.resolver';
import { PositionResolver } from './position.resolver';
import { PortfolioService } from './portfolio.service';
import { PositionService } from './position.service';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [
    LogModule,
    UsersModule,
    StockModule,
    MongooseModule.forFeature([
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: Position.name, schema: PositionSchema },
      { name: Entry.name, schema: EntrySchema },
    ]),
  ],
  providers: [
    OrderTypeScalar,
    PortfolioResolver,
    PositionResolver,
    PortfolioService,
    PositionService,
  ],
  exports: [PortfolioService],
})
export class PortfolioModule {}
