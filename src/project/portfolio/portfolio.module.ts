import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LogModule } from 'src/core/log/log.module';

import { Portfolio, PortfolioSchema } from './entities/portfolio.entity';
import {
  PositionEntry,
  PositionEntrySchema,
} from './entities/position-entry.entity';
import { Position, PositionSchema } from './entities/position.entity';
import { PortfolioResolver } from './portfolio.resolver';
import { PortfolioService } from './portfolio.service';
import { OrderTypeScalar } from './scalars/order-type.scalar';

@Module({
  imports: [
    LogModule,
    MongooseModule.forFeature([
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: PositionEntry.name, schema: PositionEntrySchema },
      { name: Position.name, schema: PositionSchema },
    ]),
  ],
  providers: [OrderTypeScalar, PortfolioResolver, PortfolioService],
})
export class PortfolioModule {}
