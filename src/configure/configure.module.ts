import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { databaseConfig } from './environment.config';
import { EnvSchema } from './environment.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ validate: EnvSchema.parse }),
    ConfigModule.forFeature(databaseConfig),
    MongooseModule.forRootAsync({
      useFactory: databaseConfig,
    }),
  ],
})
export class ConfigureModule {}
