import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAccessAuthGuard } from 'src/core/auth/guard/jwt-access-auth.guard';

import { Position } from './entities/position.entity';
import { PositionService } from './position.service';
import { PositionOwnershipGuard } from './guard/position-ownership.guard';
import { CreateEntryInput } from './dto/create-entry.input';
import { DeleteEntryInput } from './dto/delete-entry.input';

@Resolver(() => Position)
export class PositionResolver {
  constructor(private readonly positionService: PositionService) {}

  @Query(() => Position, { name: 'position' })
  @UseGuards(JwtAccessAuthGuard, PositionOwnershipGuard)
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return await this.positionService.findById(id);
  }

  @Mutation(() => Position)
  @UseGuards(JwtAccessAuthGuard)
  async registerEntry(@Args('input') input: CreateEntryInput) {
    return await this.positionService.registerEntry(input);
  }

  @Mutation(() => Position)
  @UseGuards(JwtAccessAuthGuard, PositionOwnershipGuard)
  async deleteEntry(@Args('input') input: DeleteEntryInput) {
    return await this.positionService.deleteEntry(input);
  }
}
