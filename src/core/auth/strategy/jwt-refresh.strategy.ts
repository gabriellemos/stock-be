import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { LoggedUser } from '../dto/logged-user';
import { RefreshTokenService } from '../refresh-token.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(private readonly refreshTokenService: RefreshTokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'refresh-secret', // TODO: uptade to env value
    });
  }

  async validate(payload: any): Promise<LoggedUser> {
    if (!(await this.refreshTokenService.isValid(payload.sub))) {
      throw new UnauthorizedException({ message: 'Invalid token' });
    }
    return { userID: payload.user, refreshID: payload.sub };
  }
}
