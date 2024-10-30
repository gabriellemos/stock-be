import { registerAs } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import type { ConfigType } from '@nestjs/config';

const authConfig = registerAs('authentication', () => ({
  accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
}));

export const AuthConfigKey = authConfig.KEY;
export const AuthConfigModule = ConfigModule.forFeature(authConfig);
export type AuthConfig = ConfigType<typeof authConfig>;
