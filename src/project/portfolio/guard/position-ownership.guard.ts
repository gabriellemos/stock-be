import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Types as MongooseTypes } from 'mongoose';

import { LoggedUser } from 'src/core/auth/dto/logged-user';
import { PortfolioService } from 'src/project/portfolio/portfolio.service';

import { PositionService } from '../position.service';

@Injectable()
export class PositionOwnershipGuard implements CanActivate {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly positionService: PositionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user as LoggedUser;
    const args = ctx.getArgs();

    const id = args.id || args.input.portfolioId;
    const position = await this.positionService.findById(id);

    const portfolioId =
      position.portfolio instanceof MongooseTypes.ObjectId
        ? position.portfolio.toString()
        : position.portfolio.id;

    const portfolio = await this.portfolioService.findById(portfolioId);

    if (!portfolio) {
      return false;
    }

    const ownerId =
      portfolio.owner instanceof MongooseTypes.ObjectId
        ? portfolio.owner.toString()
        : portfolio.owner.id;

    return ownerId === user.userID;
  }
}
