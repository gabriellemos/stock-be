import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as AuthConsts from './auth.constants';

const SERVICE_MAPPING = {
  [AuthConsts.ACCESS_JWT_SERVICE]: {
    key: 'authentication.accessTokenSecret',
    expiresIn: '60s',
  },
  [AuthConsts.REFRESH_JWT_SERVICE]: {
    key: 'authentication.refreshTokenSecret',
    expiresIn: '14d',
  },
};

export const generateJwtProviderFor = (
  provide: keyof typeof SERVICE_MAPPING,
) => ({
  provide,
  useFactory: async (configService: ConfigService) => {
    const { key, expiresIn } = SERVICE_MAPPING[provide];
    return new JwtService({
      secret: configService.get(key),
      signOptions: { expiresIn },
    });
  },
  inject: [ConfigService],
});
