import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { ConfigureModule } from 'src/core/configure/configure.module';
import { AuthModule } from 'src/core/auth/auth.module';
import { LogService } from 'src/core/log/log.service';
import { MailService } from 'src/core/mail/mail.service';

import { TestHelper } from 'test/utils';
import { mockedLogService } from 'test/mocks/mocked-log.module';
import { mockedMailService } from 'test/mocks/mocked-mail.module';

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
          errors: [
            expect.objectContaining({
              message: 'Invalid login or password',
            }),
          ],
          data: null,
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
          errors: [
            expect.objectContaining({
              message: 'Invalid login or password',
            }),
          ],
          data: null,
        });

        mockedMailService.expectNoEmailToBeSent();
        mockedLogService.expectNoLogToBeMade();
      });
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
