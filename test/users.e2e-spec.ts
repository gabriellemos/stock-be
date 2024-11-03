import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { ConfigureModule } from 'src/core/configure/configure.module';
import { UsersModule } from 'src/core/users/users.module';
import { LogService } from 'src/core/log/log.service';
import { MailService } from 'src/core/mail/mail.service';

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
      .overrideProvider(LogService)
      .useValue(mockedLogService)
      .overrideProvider(MailService)
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
  });

  describe('mutation register', () => {
    const registerMutation = `
      mutation RegisterUser($input: RegisterUserInput!) {
        register(input: $input) {
          _id
          name
          email
        }
      }
    `;

    it('registers a new user', async () => {
      const userInput = { name: 'John Jr.', email: 'junior@example.com' };
      const response = await gqlRequest(app, registerMutation, {
        input: userInput,
      });

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        data: {
          register: {
            _id: expect.any(String),
            ...userInput,
          },
        },
      });

      expect(mockedMailService.confirmSignUp).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining(userInput),
        expect.any(String),
      );
    });

    describe('invalid user', () => {
      it('email already taken', async () => {
        const response = await gqlRequest(app, registerMutation, {
          input: { name: 'Jane Jr.', email: Consts.USERS.JOHN_DOE.EMAIL },
        });

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          errors: [
            expect.objectContaining({
              message: 'User already registered',
            }),
          ],
          data: null,
        });

        expect(mockedMailService.confirmSignUp).not.toHaveBeenCalled();
      });
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
