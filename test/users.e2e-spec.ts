import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { addDays } from 'date-fns';
import MockDate from 'mockdate';

import { ConfigureModule } from 'src/core/configure/configure.module';
import { AuthModule } from 'src/core/auth/auth.module';
import { LogService } from 'src/core/log/log.service';
import { MailService } from 'src/core/mail/mail.service';

import Consts from 'test/utils/conts';
import { TestHelper } from 'test/utils';
import { mockedLogService } from 'test/mocks/mocked-log.module';
import { mockedMailService } from 'test/mocks/mocked-mail.module';

const registerMutation = `
  mutation RegisterUser($input: RegisterUserInput!) {
    register(input: $input) {
      _id
      name
      email
    }
  }
`;

const setPasswordMutation = `
  mutation SetPassword($input: SetPasswordInput!) {
    setPassword(input: $input) {
      _id
    }
  }
`;

const updatePasswordMutation = `
  mutation UpdatePassword($input: UpdatePasswordInput!) {
    updatePassword(input: $input) {
      _id
    }
  }
`;

const forgotPasswordMutation = `
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) {
      _id
    }
  }
`;

describe('Users (e2e)', () => {
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

  describe('mutation register', () => {
    it('registers a new user', async () => {
      const userInput = { name: 'John Jr.', email: 'junior@example.com' };
      const response = await helper.gqlRequest(registerMutation, {
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

      // Confirm that log service was called
      expect(mockedLogService.logInfo).toHaveBeenNthCalledWith(
        1,
        '[RegisterUser] new user',
        { input: userInput },
      );

      // Confirm that action for sending sign up email was called
      expect(mockedMailService.confirmSignUp).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining(userInput),
        expect.any(String),
      );
    });

    describe('invalid user', () => {
      it('email already taken', async () => {
        const response = await helper.gqlRequest(registerMutation, {
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

        // Confirm if log and mail services were not called
        mockedMailService.expectNoEmailToBeSent();
        mockedLogService.expectNoLogToBeMade();
      });
    });
  });

  describe('mutation setPassword', () => {
    const setPassword = async (userID: string, secret: string) => {
      return await helper.gqlRequest(setPasswordMutation, {
        input: {
          _id: userID,
          newPassword: 'secure-password',
          secret,
        },
      });
    };

    it('update password for a user', async () => {
      const { user, secret } = await helper.registerUser();
      const response = await setPassword(user.id, secret);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        data: {
          setPassword: {
            _id: user.id,
          },
        },
      });

      mockedMailService.expectNoEmailToBeSent();
      expect(mockedLogService.logInfo).toHaveBeenNthCalledWith(
        1,
        '[ResetPassword] password updated',
        { userId: user.id },
      );
    });

    describe('invalid secret', () => {
      it('secret belongs to another user', async () => {
        const { user } = await helper.registerUser();
        const { secret } = await helper.registerUser();

        const response = await setPassword(user.id, secret);

        expect(response.body).toStrictEqual({
          errors: [
            expect.objectContaining({
              message: 'Invalid request',
            }),
          ],
          data: null,
        });

        mockedMailService.expectNoEmailToBeSent();
        expect(mockedLogService.logWarn).toHaveBeenNthCalledWith(
          1,
          "[ResetPassword] someone else's token",
          { userId: user.id },
        );
      });

      it('secret exists but is expired', async () => {
        const { user, secret } = await helper.registerUser();

        MockDate.set(addDays(user.secret.expriresAt, 1));
        const response = await setPassword(user.id, secret);
        MockDate.reset();

        expect(response.body).toStrictEqual({
          errors: [
            expect.objectContaining({
              message: 'Invalid request',
            }),
          ],
          data: null,
        });

        mockedMailService.expectNoEmailToBeSent();
        expect(mockedLogService.logInfo).toHaveBeenNthCalledWith(
          1,
          '[ResetPassword] expired token',
          { userId: user.id },
        );
      });

      it('password change not requested', async () => {
        const response = await setPassword(
          Consts.USERS.JOHN_DOE.ID,
          'non-existent',
        );

        expect(response.body).toStrictEqual({
          errors: [
            expect.objectContaining({
              message: 'Invalid request',
            }),
          ],
          data: null,
        });

        mockedMailService.expectNoEmailToBeSent();
        expect(mockedLogService.logWarn).toHaveBeenNthCalledWith(
          1,
          "[ResetPassword] someone else's token",
          { userId: Consts.USERS.JOHN_DOE.ID },
        );
      });

      it('user does not exist', async () => {
        const response = await setPassword(Consts.ALZR11_ID, 'non-existent');

        expect(response.body).toStrictEqual({
          errors: [
            expect.objectContaining({
              message: 'Invalid request',
            }),
          ],
          data: null,
        });

        mockedMailService.expectNoEmailToBeSent();
        mockedLogService.expectNoLogToBeMade();
      });

      // try 'non-existent' as user ID
      it.todo('invalid user ID');
    });
  });

  describe('mutation updatePassword', () => {
    const newPassword = 'updated-password';

    it('update password for a user', async () => {
      const { user, password } = await helper.registerUserAndLogin();

      const response = await helper.gqlRequest(updatePasswordMutation, {
        input: { oldPassword: password, newPassword },
      });

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        data: {
          updatePassword: {
            _id: user.id,
          },
        },
      });

      mockedMailService.expectNoEmailToBeSent();
      mockedLogService.expectNoLogToBeMade();

      // Current password is checked before updating
      // If this request fails, the password is not updated.
      const otherResponse = await helper.gqlRequest(updatePasswordMutation, {
        input: { oldPassword: newPassword, newPassword: 'secure-as-possible' },
      });

      expect(otherResponse.status).toBe(200);
      expect(otherResponse.body).toStrictEqual({
        data: {
          updatePassword: {
            _id: user.id,
          },
        },
      });
    });

    describe('invalid data', () => {
      it.todo('password does not match');
      it.todo('password validation failed: min size');
      it.todo('password validation failed: aphanumeric');
      it.todo('password validation failed: special char');
      it.todo('expired access token');
    });
  });

  describe('mutation forgotPassword', () => {
    const forgotPassword = async (email: string) => {
      return await helper.gqlRequest(forgotPasswordMutation, {
        input: { email },
      });
    };

    it('reset password for a user', async () => {
      const { user } = await helper.registerUser();
      const response = await forgotPassword(user.email);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        data: {
          forgotPassword: {
            _id: user.id,
          },
        },
      });

      const { secret: oldSecret } = user;
      expect(mockedMailService.forgotPassword).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ id: user.id, email: user.email }),
        expect.not.stringMatching(oldSecret.id),
      );
      expect(mockedLogService.logInfo).toHaveBeenNthCalledWith(
        1,
        '[ForgotPassword] Password forgotten',
        { userId: user.id },
      );
    });

    describe('invalid user', () => {
      it('user does not exist', async () => {
        const response = await forgotPassword('unexisting-user@example.com');

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          errors: [
            expect.objectContaining({
              message: 'Invalid request',
            }),
          ],
          data: null,
        });
      });
    });
  });
});
