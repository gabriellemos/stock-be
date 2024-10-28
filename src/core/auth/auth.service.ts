import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoggedUser } from './dto/logged-user';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private formatUser(user: User) {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      password: _ignorePassword,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      secret: _ignoreSecret,
      ...result
    } = user;
    return result;
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email).lean();
    if (user && (await bcrypt.compare(password, user.password))) {
      return null // this.formatUser(user); // TODO: Fix me
    }
    return null;
  }

  async login(user: User) {
    const refreshToken = await this.refreshTokenService.register(user);

    return {
      access_token: this.jwtService.sign({
        sub: refreshToken.user._id,
        refresh: refreshToken.id,
      }),
      refresh_token: this.jwtService.sign(
        { sub: refreshToken.id, user: refreshToken.user._id },
        { secret: 'refresh-secret', expiresIn: '14d' }, // TODO: uptade to env value
      ),
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
      access_token: this.jwtService.sign({
        sub: refreshToken.user._id,
        refresh: refreshToken.id,
      }),
    };
  }
}
