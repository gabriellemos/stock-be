import { UseGuards } from '@nestjs/common';
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
import { Types as MongooseTypes } from 'mongoose';

import { JwtAccessAuthGuard } from 'src/core/auth/guard/jwt-access-auth.guard';
import { CurrentUser } from 'src/core/auth/decorator/current-user.decorator';
import { LoggedUser } from 'src/core/auth/dto/logged-user';
import { User } from 'src/core/users/entities/user.entity';
import { UsersService } from 'src/core/users/users.service';

import { PortfolioOwnershipGuard } from './guard/portfolio-ownership.guard';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioInput } from './dto/create-portfolio.input';
import { UpdatePortfolioInput } from './dto/update-portfolio.input';
import { DeletePortfolioInput } from './dto/delete-portfolio.input';
import { Portfolio } from './entities/portfolio.entity';
import { Position } from './entities/position.entity';
import { Entry } from './entities/entry.entity';

@Resolver(() => Portfolio)
export class PortfolioResolver {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly usersService: UsersService,
  ) {}

  @Query(() => Portfolio, { name: 'portfolio' })
  @UseGuards(JwtAccessAuthGuard, PortfolioOwnershipGuard)
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return await this.portfolioService.findById(id);
  }

  @Query(() => [Portfolio])
  @UseGuards(JwtAccessAuthGuard)
  async myPortfolios(@CurrentUser() loggedUser: LoggedUser) {
    return await this.portfolioService.findByOwner(loggedUser.userID);
  }

  @Mutation(() => Portfolio)
  @UseGuards(JwtAccessAuthGuard)
  async createPortfolio(
    @CurrentUser() loggedUser: LoggedUser,
    @Args('input') input: CreatePortfolioInput,
  ) {
    return await this.portfolioService.create(loggedUser.userID, input);
  }

  @Mutation(() => Portfolio)
  @UseGuards(JwtAccessAuthGuard, PortfolioOwnershipGuard)
  async updatePortfolio(@Args('input') input: UpdatePortfolioInput) {
    return await this.portfolioService.update(input);
  }

  @Mutation(() => Portfolio)
  @UseGuards(JwtAccessAuthGuard, PortfolioOwnershipGuard)
  async deletePortfolio(@Args('input') input: DeletePortfolioInput) {
    return await this.portfolioService.update(input);
  }

  @ResolveField(() => [Entry])
  async entries(@Parent() portfolio: Portfolio) {
    return [];
  }

  @ResolveField(() => [Position])
  async positions(@Parent() portfolio: Portfolio) {
    return [];
  }

  @ResolveField(() => User)
  async owner(@Parent() portfolio: Portfolio) {
    if (portfolio.owner instanceof MongooseTypes.ObjectId) {
      return this.usersService.findById(portfolio.owner.toString());
    }
    return portfolio.owner as User;
  }
}
