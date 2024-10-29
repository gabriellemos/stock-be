import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';

import * as AuthConsts from './auth.constants';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtAccessStrategy } from './strategy/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';
import { UsersModule } from '../users/users.module';
import { AuthResolver } from './auth.resolver';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './entity/refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';
import { AuthConfigModule } from './auth.config';
import { generateJwtProviderFor } from './jwt.factory';

@Module({
  imports: [
    AuthConfigModule,
    PassportModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
  ],
  providers: [
    generateJwtProviderFor(AuthConsts.ACCESS_JWT_SERVICE),
    generateJwtProviderFor(AuthConsts.REFRESH_JWT_SERVICE),
    AuthResolver,
    AuthService,
    RefreshTokenService,
    LocalStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
})
export class AuthModule {}
