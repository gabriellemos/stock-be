import { Args, ID, Query, Resolver } from '@nestjs/graphql';

import { Portfolio } from './entities/portfolio.entity';
// import { PaginatedPrice } from './dto/paginated-price.response';
// import { TrackStockInput } from './dto/track-stock.input';
import { PortfolioService } from './portfolio.service';

@Resolver(() => Portfolio)
export class PortfolioResolver {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Query(() => Portfolio, { name: 'portfolio' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return await this.portfolioService.findById(id);
  }
}
