import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { LoggedUser } from '../dto/logged-user';
import { RefreshTokenService } from '../refresh-token.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token',
) {
  constructor(private readonly refreshTokenService: RefreshTokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'access-secret', // TODO: uptade to env value
    });
  }

  async validate(payload: any): Promise<LoggedUser> {
    if (!(await this.refreshTokenService.isValid(payload.refresh))) {
      throw new UnauthorizedException({ message: 'Invalid token' });
    }
    return { userID: payload.sub, refreshID: payload.refresh };
  }
}
