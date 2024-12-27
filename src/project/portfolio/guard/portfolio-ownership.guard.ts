import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { LoggedUser } from 'src/core/auth/dto/logged-user';

import { PortfolioService } from '../portfolio.service';
import { Types as MongooseTypes } from 'mongoose';

@Injectable()
export class PortfolioOwnershipGuard implements CanActivate {
  constructor(private readonly portfolioService: PortfolioService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user as LoggedUser;
    const args = ctx.getArgs();

    const id = args.id || args.input._id;
    const portfolio = await this.portfolioService.findById(id);

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
