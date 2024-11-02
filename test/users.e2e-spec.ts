import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { startOfDay } from 'date-fns';
import MockDate from 'mockdate';

import { ConfigureModule } from 'src/core/configure/configure.module';
import { LogModule } from 'src/core/log/log.module';
import { UsersModule } from 'src/core/users/users.module';
import { MailModule } from 'src/core/mail/mail.module';

import Consts from 'test/utils/conts';
import { gqlRequest } from 'test/utils';
import { mockedLogService } from 'test/mocks/mocked-log.module';
import { mockedMailService } from 'test/mocks/mocked-mail.module';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigureModule, UsersModule],
    })
      .overrideProvider(LogModule)
      .useValue(mockedLogService)
      .overrideProvider(MailModule)
      .useValue(mockedMailService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockedLogService.mockReset();
    mockedMailService.mockReset();
    MockDate.set(startOfDay(new Date('2024-10-21T19:56:00Z')));
  });

  describe('mutation register', () => {
    it.todo('registers a new user');
    it.todo('send email with secret');

    describe('invalid user', () => {
      it.todo('email already taken');
    });
  });

  describe('mutation setPassword', () => {
    it.todo('update password for a user');

    describe('invalid secret', () => {
      it.todo('secret exists but belongs to another user');
      it.todo('secret exists but is expired');
      it.todo('secret does not exist');
      it.todo('user does not exist');
    });
  });

  describe('mutation updatePassword', () => {
    it.todo('update password for a user');

    describe('invalid data', () => {
      it.todo('password does not match');
      it.todo('password validation failed: min size');
      it.todo('password validation failed: aphanumeric');
      it.todo('password validation failed: special char');
      it.todo('expired access token');
    });
  });

  describe('mutation forgotPassword', () => {
    it.todo('reset password for a user');
    it.todo('send email with secret');

    describe('invalid user', () => {
      it.todo('user does not exist');
    });
  });
});
