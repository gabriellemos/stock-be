import { registerAs } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';

const secretsConfig = registerAs('authentication', () => ({
  accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
}));

export const AuthConfigModule = ConfigModule.forFeature(secretsConfig);
