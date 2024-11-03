import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginUserInput } from './dto/login-user.input';
import { LoginResponse } from './dto/login-response';
import { RefreshTokenResponse } from './dto/refresh-token-response';

import { GqlAuthGuard } from './guard/gql-auth.guard';
import { JwtAccessAuthGuard } from './guard/jwt-access-auth.guard';
import { JwtRefreshAuthGuard } from './guard/jwt-refresh-auth.guard';
import { CurrentUser } from './decorator/current-user.decorator';
import { LoggedUser } from './dto/logged-user';
import { LogoutResponse } from './dto/logout-response';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => LoginResponse)
  login(@Args('input') _: LoginUserInput, @Context() context) {
    return this.authService.login(context.user);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Mutation(() => RefreshTokenResponse)
  refresh(@Context() context) {
    const { refreshID } = context.req.user;
    return this.authService.refresh(refreshID);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Mutation(() => LogoutResponse)
  logout(@CurrentUser() user: LoggedUser) {
    return this.authService.logout(user);
  }
}
