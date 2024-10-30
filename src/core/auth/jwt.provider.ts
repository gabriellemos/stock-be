import { JwtService } from '@nestjs/jwt';

import { AuthConfigKey } from './auth.config';
import { type AuthConfig } from './auth.config';
import * as AuthConsts from './auth.constants';

export const AccessJwtProvider = {
  provide: AuthConsts.ACCESS_JWT_SERVICE,
  useFactory: (authConfig: AuthConfig) => {
    return new JwtService({
      secret: authConfig.accessTokenSecret,
      signOptions: { expiresIn: '60s' },
    });
  },
  inject: [AuthConfigKey],
};

export const RefreshJwtProvider = {
  provide: AuthConsts.REFRESH_JWT_SERVICE,
  useFactory: (authConfig: AuthConfig) => {
    return new JwtService({
      secret: authConfig.refreshTokenSecret,
      signOptions: { expiresIn: '14d' },
    });
  },
  inject: [AuthConfigKey],
};
