import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { addDays, addSeconds } from 'date-fns';
import MockDate from 'mockdate';

import { ConfigureModule } from 'src/core/configure/configure.module';
import { AuthModule } from 'src/core/auth/auth.module';
import { LogService } from 'src/core/log/log.service';
import { MailService } from 'src/core/mail/mail.service';

import { TestHelper } from 'test/utils';
import { generateLogService } from 'test/mocks/mocked-log.module';
import { generateMailService } from 'test/mocks/mocked-mail.module';

const loginMutation = `
  mutation LoginUser($input: LoginUserInput!) {
    login(input: $input) {
      access_token
      refresh_token
      user {
        _id
      }
    }
  }
`;

const refreshMutation = `
  mutation RefreshToken {
    refresh {
      access_token
    }
  }
`;

const logoutMutation = `
  mutation LogoutUser {
    logout {
      user {
        _id
      }
    }
  }
`;

const mockedLogService = generateLogService();
const mockedMailService = generateMailService();

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
    helper = TestHelper(app, {
      logService: mockedLogService,
      mailService: mockedMailService,
    });
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
    it('successfull operation', async () => {
      const { user, password } = await helper.registerUserWithPassword();
      const response = await helper.gqlRequest(loginMutation, {
        input: { email: user.email, password },
      });

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        data: {
          login: {
            access_token: expect.any(String),
            refresh_token: expect.any(String),
            user: { _id: user.id },
          },
        },
      });

      mockedMailService.expectNoEmailToBeSent();
      mockedLogService.expectNoLogToBeMade();
    });

    it('secure fields', async () => {
      const loginMutation = `
          mutation LoginUser($input: LoginUserInput!) {
            login(input: $input) {
              user {
                password
                secret {
                  _id
                }
              }
            }
          }
        `;

      const { user, password } = await helper.registerUserWithPassword();
      const response = await helper.gqlRequest(loginMutation, {
        input: { email: user.email, password },
      });

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        errors: [
          expect.objectContaining({
            extensions: {
              code: 'GRAPHQL_VALIDATION_FAILED',
            },
            message: 'Cannot query field "password" on type "User".',
          }),
          expect.objectContaining({
            extensions: {
              code: 'GRAPHQL_VALIDATION_FAILED',
            },
            message: 'Cannot query field "secret" on type "User".',
          }),
        ],
      });
    });

    describe('invalid operation', () => {
      it('user not found', async () => {
        const response = await helper.gqlRequest(loginMutation, {
          input: {
            email: 'unregistered-email@example.com',
            password: 's3cur3-p@ssw0rd',
          },
        });

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          data: null,
          errors: [
            expect.objectContaining({
              message: 'Invalid login or password',
            }),
          ],
        });

        mockedMailService.expectNoEmailToBeSent();
        mockedLogService.expectNoLogToBeMade();
      });

      it('incorrect password', async () => {
        const { user } = await helper.registerUserWithPassword();
        const response = await helper.gqlRequest(loginMutation, {
          input: { email: user.email, password: 'wr0ng-p@ssw0rd' },
        });

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          data: null,
          errors: [
            expect.objectContaining({
              message: 'Invalid login or password',
            }),
          ],
        });

        mockedMailService.expectNoEmailToBeSent();
        mockedLogService.expectNoLogToBeMade();
      });
    });
  });

  describe('logout mutation', () => {
    it('successfull operation', async () => {
      const { user, password } = await helper.registerUserWithPassword();
      await helper.loginWith(user.email, password, { storeTokens: true });

      const response = await helper.gqlRequest(logoutMutation);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        data: {
          logout: {
            user: { _id: user.id },
          },
        },
      });

      const rejectedResponse = await helper.gqlRequest(logoutMutation);

      expect(rejectedResponse.status).toBe(200);
      expect(rejectedResponse.body).toStrictEqual({
        data: null,
        errors: [expect.objectContaining({ message: 'Invalid token' })],
      });
    });

    describe('invalid operation', () => {
      it('access token expired', async () => {
        const mockedDate = new Date('2024-10-21T19:56:00Z');
        MockDate.set(mockedDate);

        const { user, password } = await helper.registerUserWithPassword();
        await helper.loginWith(user.email, password, { storeTokens: true });

        MockDate.set(addSeconds(mockedDate, 60));

        const response = await helper.gqlRequest(logoutMutation);
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          data: null,
          errors: [expect.objectContaining({ message: 'Unauthorized' })],
        });

        MockDate.reset();
      });

      it('access token not provided', async () => {
        const { user, password } = await helper.registerUserWithPassword();

        await helper.loginWith(user.email, password, { storeTokens: false });
        const response = await helper.gqlRequest(logoutMutation);

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          data: null,
          errors: [expect.objectContaining({ message: 'Unauthorized' })],
        });
      });
    });
  });

  describe('refresh mutation', () => {
    it('successfull operation', async () => {
      const { user, password } = await helper.registerUserWithPassword();
      const { refreshToken } = await helper.loginWith(user.email, password, {
        storeTokens: true,
      });

      const response = await helper.gqlRequest(
        refreshMutation,
        {},
        { token: refreshToken },
      );

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        data: {
          refresh: {
            access_token: expect.any(String),
          },
        },
      });
    });

    describe('invalid operation', () => {
      it('refresh token expired', async () => {
        const mockedDate = new Date('2024-10-21T19:56:00Z');
        MockDate.set(mockedDate);

        const { user, password } = await helper.registerUserWithPassword();
        const { refreshToken } = await helper.loginWith(user.email, password, {
          storeTokens: true,
        });

        MockDate.set(addDays(mockedDate, 14));

        const response = await helper.gqlRequest(
          refreshMutation,
          {},
          { token: refreshToken },
        );

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          data: null,
          errors: [expect.objectContaining({ message: 'Unauthorized' })],
        });

        MockDate.reset();
      });

      it('refresh token not provided', async () => {
        const { user, password } = await helper.registerUserWithPassword();
        await helper.loginWith(user.email, password, { storeTokens: false });

        const response = await helper.gqlRequest(
          refreshMutation,
          {},
          { token: undefined },
        );

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          data: null,
          errors: [expect.objectContaining({ message: 'Unauthorized' })],
        });
      });
    });
  });
});
