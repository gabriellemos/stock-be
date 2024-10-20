import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export async function gqlRequest(
  app: INestApplication,
  query: string,
  variables?: Record<string, any>,
) {
  return request(app.getHttpServer()).post('/graphql').send({
    query,
    variables,
  });
}
