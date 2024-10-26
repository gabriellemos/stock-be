import {
  Args,
  GraphQLISODateTime,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { GroupInterval } from 'src/common/scalars/group-interval.scalar';
import { TimeInterval } from 'src/common/scalars/time-interval.scalar';

import { Stock } from './entities/stock.entity';
import { HistoryItem } from './entities/history-item.entity';
import { PaginatedPrice } from './dto/paginated-price.response';
import { TrackStockInput } from './dto/track-stock.input';
import { StockService } from './stock.service';

@Resolver(() => Stock)
export class StockResolver {
  constructor(private readonly stockService: StockService) {}

  @Query(() => Stock, { name: 'stock' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    const stock = await this.stockService.findOne(id);

    if (!stock) {
      throw new Error(`Stock with id ${id} not found`);
    }

    return stock;
  }

  @Mutation(() => Stock)
  async trackStock(@Args('input') input: TrackStockInput) {
    return this.stockService.trackStock(input);
  }

  @ResolveField(() => HistoryItem)
  async price(@Parent() stock: Stock) {
    return await this.stockService.getUpdatedPriceOf(stock);
  }

  @ResolveField(() => PaginatedPrice)
  async prices(
    @Parent() stock: Stock,
    @Args('groupBy', {
      type: () => GroupInterval,
      nullable: true,
      defaultValue: GroupInterval.DAY,
    })
    groupBy?: GroupInterval,
    @Args('cursor', { type: () => GraphQLISODateTime, nullable: true })
    cursor?: Date,
    @Args('limit', { type: () => Number, nullable: true, defaultValue: 20 })
    limit?: number,
  ) {
    return await this.stockService.getPricesOf(stock, groupBy, cursor, limit);
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
