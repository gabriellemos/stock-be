import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import * as AuthConsts from './auth.constants';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoggedUser } from './dto/logged-user';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly usersService: UsersService,
    @Inject(AuthConsts.ACCESS_JWT_SERVICE)
    private readonly accessJwtService: JwtService,
    @Inject(AuthConsts.REFRESH_JWT_SERVICE)
    private readonly refreshJwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const refreshToken = await this.refreshTokenService.register(user);

    // TODO: Probably should send an email to the user here

    return {
      access_token: this.accessJwtService.sign({
        sub: refreshToken.user._id,
        refresh: refreshToken._id,
      }),
      refresh_token: this.refreshJwtService.sign({
        sub: refreshToken._id,
        user: refreshToken.user._id,
      }),
      user,
    };
  }

  async logout(user: LoggedUser) {
    await this.refreshTokenService.deleteToken(user.refreshID);
    return { success: true };
  }

  async refresh(id: string) {
    const refreshToken = await this.refreshTokenService.findById(id);

    return {
      access_token: this.accessJwtService.sign({
        sub: refreshToken.user._id,
        refresh: refreshToken._id,
      }),
    };
  }
}
