import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';

import { JwtAccessAuthGuard } from 'src/core/auth/guard/jwt-access-auth.guard';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';

import { ForgotPasswordInput } from './dto/forgot-password.input';
import { RegisterUserInput } from './dto/register-user.input';
import { SetPasswordInput } from './dto/set-password.input';
import { UpdatePasswordInput } from './dto/update-password.input';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { LoggedUser } from '../auth/dto/logged-user';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User)
  @UseGuards(JwtAccessAuthGuard)
  loggedUser(@CurrentUser() loggedUser: LoggedUser) {
    return this.usersService.findById(loggedUser.userID);
  }

  @Mutation(() => User)
  register(@Args('input') input: RegisterUserInput) {
    return this.usersService.register(input);
  }

  @Mutation(() => User)
  setPassword(@Args('input') input: SetPasswordInput) {
    return this.usersService.setPassword(input);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Mutation(() => User)
  updatePassword(
    @Args('input') input: UpdatePasswordInput,
    @CurrentUser() loggedUser: LoggedUser,
  ) {
    return this.usersService.updatePassword(input, loggedUser);
  }

  @Mutation(() => User)
  forgotPassword(@Args('input') input: ForgotPasswordInput) {
    return this.usersService.forgotPassword(input);
  }
}
