import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';

import { PasswordScalar } from './scalars/password.scalar';
import { databaseConfig } from './environment.config';
import { EnvSchema } from './environment.schema';

const getEnvFilePath = () => {
  const isTestEnvironment = process.env.NODE_ENV === 'test';
  return isTestEnvironment ? '.env.test.local' : '.env';
};

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: getEnvFilePath(),
      validate: EnvSchema.parse,
    }),
    ConfigModule.forFeature(databaseConfig),
    MongooseModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      resolvers: { Password: PasswordScalar },
    }),
  ],
})
export class ConfigureModule {}
