import { Args, Query, Resolver, ResolveField, Parent } from '@nestjs/graphql';

import { Stock } from './entities/stock.entity';
import { HistoryItem } from './entities/history-item.entity';
import { StockService } from './stock.service';

@Resolver(() => Stock)
export class StockResolver {
  constructor(private readonly stockService: StockService) {}

  @Query(() => Stock, { name: 'stock' })
  async findOne(@Args('id') id: string) {
    return this.stockService.findOne(id);
  }

  @ResolveField(() => HistoryItem)
  async price(@Parent() stock: Stock) {
    return await this.stockService.getUpdatedPriceOf(stock);
  }
}
