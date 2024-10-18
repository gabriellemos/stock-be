import { Args, Query, Resolver } from '@nestjs/graphql';

import { Stock } from './entities/stock.entity';
import { StockService } from './stock.service';

@Resolver()
export class StockResolver {
  constructor(private readonly stockService: StockService) {}

  @Query(() => Stock, { name: 'stock' })
  async findOne(@Args('id') id: string) {
    return this.stockService.findOne(id);
  }
}
