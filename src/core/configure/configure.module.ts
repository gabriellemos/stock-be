import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';

import { databaseConfig } from './environment.config';
import { EnvSchema } from './environment.schema';

const getEnvFilePath = () => {
  const isTestEnvironment = process.env.NODE_ENV === 'test';
  return isTestEnvironment ? '.env.test.local' : '.env';
};

const pathToSchemaFile = () => {
  if (process.env.NODE_ENV === 'test') {
    return join(process.cwd(), 'src/schema-test.gql');
  }
  return join(process.cwd(), 'src/schema.gql');
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
      autoSchemaFile: pathToSchemaFile(),
      includeStacktraceInErrorResponses: false,
    }),
  ],
})
export class ConfigureModule {}
