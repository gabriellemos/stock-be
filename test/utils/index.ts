import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { uniqueId } from 'lodash';

import { mockedLogService } from 'test/mocks/mocked-log.module';
import { mockedMailService } from 'test/mocks/mocked-mail.module';

export const TestHelper = (app: INestApplication) => {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  const gqlRequest = async (
    query: string,
    variables?: Record<string, any>,
    options?: { token?: string },
  ) => {
    let requestBuilder = request(app.getHttpServer()).post('/graphql');

    if (accessToken || options?.token) {
      requestBuilder = requestBuilder.set(
        'Authorization',
        `Bearer ${options?.token || accessToken}`,
      );
    }

    return requestBuilder.send({ query, variables });
  };

  const loginWith = async (
    email: string,
    password: string,
    options: { storeTokens?: boolean } = {},
  ) => {
    const loginMutation = `
      mutation LoginWith($input: LoginUserInput!) {
        login(input: $input) {
          access_token
          refresh_token
        }
      }
    `;

    const { storeTokens = true } = options;
    const response = await gqlRequest(loginMutation, {
      input: { email, password },
    });

    expect(response.status).toBe(200);
    mockedLogService.expectNoLogToBeMade();
    mockedMailService.expectNoEmailToBeSent();

    if (storeTokens) {
      accessToken = response.body.data.login.access_token;
      refreshToken = response.body.data.login.refresh_token;
    }
    return { accessToken, refreshToken };
  };

  const logout = async () => {
    const logoutMutation = `
      mutation Logout {
        logout {
          success
        }
      }
    `;

    const response = await gqlRequest(logoutMutation);

    expect(response.status).toBe(200);
    mockedLogService.expectNoLogToBeMade();
    mockedMailService.expectNoEmailToBeSent();

    accessToken = null;
    refreshToken = null;
  };

  const registerUser = async () => {
    const registerMutation = `
      mutation RegisterUser($input: RegisterUserInput!) {
        register(input: $input) {
          _id
          name
          email
        }
      }
    `;

    const username = uniqueId('user-');
    const response = await gqlRequest(registerMutation, {
      input: { name: username, email: `${username}@example.com` },
    });

    expect(response.status).toBe(200);
    expect(mockedMailService.confirmSignUp).toHaveBeenCalledTimes(1);
    const [user, secret] = mockedMailService.confirmSignUp.mock.calls[0];

    // Reset mocks to avoid issues with tests
    mockedLogService.mockReset();
    mockedMailService.mockReset();

    return { user, secret };
  };

  const registerUserWithPassword = async (password = 's3cur3-p@ssw0rd') => {
    const setPasswordMutation = `
      mutation SetPassword($input: SetPasswordInput!) {
        setPassword(input: $input) {
          _id
        }
      }
    `;

    const { user, secret } = await registerUser();
    const input = { _id: user.id, newPassword: password, secret };
    const response = await gqlRequest(setPasswordMutation, { input });

    expect(response.status).toBe(200);
    expect(mockedLogService.logInfo).toHaveBeenCalledTimes(1);
    mockedMailService.expectNoEmailToBeSent();

    // Reset mocks to avoid issues with tests
    mockedLogService.mockReset();
    mockedMailService.mockReset();

    return { user, password };
  };

  const registerUserAndLogin = async () => {
    const { user, password } = await registerUserWithPassword();
    await loginWith(user.email, password);
    return { user, password };
  };

  const reset = () => {
    accessToken = null;
    refreshToken = null;
  };

  return {
    gqlRequest,
    loginWith,
    logout,
    registerUser,
    registerUserAndLogin,
    registerUserWithPassword,
    reset,
  };
};
