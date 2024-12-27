import { UseGuards } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';

import { JwtAccessAuthGuard } from 'src/core/auth/guard/jwt-access-auth.guard';

import { PortfolioOwnershipGuard } from './guard/portfolio-ownership.guard';
import { Portfolio } from './entities/portfolio.entity';
import { PortfolioService } from './portfolio.service';

@Resolver(() => Portfolio)
export class PortfolioResolver {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Query(() => Portfolio, { name: 'portfolio' })
  @UseGuards(JwtAccessAuthGuard, PortfolioOwnershipGuard)
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return await this.portfolioService.findById(id);
  }
}
