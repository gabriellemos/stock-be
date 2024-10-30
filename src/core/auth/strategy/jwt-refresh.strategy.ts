import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthConfigKey } from '../auth.config';
import { type AuthConfig } from '../auth.config';
import { LoggedUser } from '../dto/logged-user';
import { RefreshTokenService } from '../refresh-token.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    @Inject(AuthConfigKey)
    private readonly authConfig: AuthConfig,
    private readonly refreshTokenService: RefreshTokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.refreshTokenSecret,
    });
  }

  async validate(payload: any): Promise<LoggedUser> {
    if (!(await this.refreshTokenService.isValid(payload.sub))) {
      throw new UnauthorizedException({ message: 'Invalid token' });
    }
    return { userID: payload.user, refreshID: payload.sub };
  }
}
