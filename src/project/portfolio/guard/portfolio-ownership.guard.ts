import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { LoggedUser } from 'src/core/auth/dto/logged-user';

import { PortfolioService } from '../portfolio.service';

@Injectable()
export class PortfolioOwnershipGuard implements CanActivate {
  constructor(private readonly portfolioService: PortfolioService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user as LoggedUser;
    const args = ctx.getArgs();

    const portfolio = await this.portfolioService.findById(args.id);
    return portfolio && portfolio.owner.id === user.userID;
  }
}
