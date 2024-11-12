import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { ConfigureModule } from 'src/core/configure/configure.module';
import { AuthModule } from 'src/core/auth/auth.module';
import { LogService } from 'src/core/log/log.service';
import { MailService } from 'src/core/mail/mail.service';

import { TestHelper } from 'test/utils';
import { mockedLogService } from 'test/mocks/mocked-log.module';
import { mockedMailService } from 'test/mocks/mocked-mail.module';

describe('Auth (e2e)', () => {
  let helper: ReturnType<typeof TestHelper>;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [ConfigureModule, AuthModule],
    })
      .overrideProvider(LogService)
      .useValue(mockedLogService)
      .overrideProvider(MailService)
      .useValue(mockedMailService)
      .compile();

    app = moduleFixture.createNestApplication();
    helper = TestHelper(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockedLogService.mockReset();
    mockedMailService.mockReset();
    helper.reset();
  });

  describe('login mutation', () => {
    it.todo('successfull operation');

    describe('invalid operation', () => {
      it.todo('user not found');
      it.todo('incorrect password');
    });
  });

  describe('logout mutation', () => {
    it.todo('successfull operation');

    describe('invalid operation', () => {
      it.todo('access token expired');
      it.todo('access token not provided');
    });
  });

  describe('refresh mutation', () => {
    it.todo('successfull operation');

    describe('invalid operation', () => {
      it.todo('refresh token expired');
      it.todo('refresh token not provided');
    });
  });
});
