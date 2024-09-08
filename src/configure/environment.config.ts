import { registerAs } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';

export const databaseConfig = registerAs(
  'database',
  (): MongooseModuleFactoryOptions => ({
    uri: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    pass: process.env.DATABASE_PASS,
    dbName: process.env.DATABASE_NAME,
  }),
);
