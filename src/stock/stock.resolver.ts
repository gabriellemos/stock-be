import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { TimeInterval } from 'src/common/scalars/time-interval.scalar';

import { Stock } from './entities/stock.entity';
import { HistoryItem } from './entities/history-item.entity';
import { TrackStockInput } from './dto/track-stock.input';
import { StockService } from './stock.service';

@Resolver(() => Stock)
export class StockResolver {
  constructor(private readonly stockService: StockService) {}

  @Query(() => Stock, { name: 'stock' })
  async findOne(@Args('id') id: string) {
    return this.stockService.findOne(id);
  }

  @Mutation(() => Stock)
  async trackStock(@Args('input') input: TrackStockInput) {
    return this.stockService.trackStock(input);
  }

  @ResolveField(() => HistoryItem)
  async price(@Parent() stock: Stock) {
    return await this.stockService.getUpdatedPriceOf(stock);
  }

  @ResolveField(() => [HistoryItem])
  async priceHistory(
    @Parent() stock: Stock,
    @Args('period', {
      type: () => TimeInterval,
      nullable: true,
      defaultValue: TimeInterval.ONE_MONTH,
    })
    timeInterval?: TimeInterval,
  ) {
    return await this.stockService.getPriceHistoryOf(stock, timeInterval);
  }
}
