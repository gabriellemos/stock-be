import { MailService } from 'src/core/mail/mail.service';

type MockType = jest.Mocked<Partial<MailService>> & { mockReset: () => void };

const mockedConfirmSignUp = jest.fn();
const mockedForgotPassword = jest.fn();

export const mockedMailService: MockType = {
  confirmSignUp: mockedConfirmSignUp,
  forgotPassword: mockedForgotPassword,

  mockReset: () => {
    mockedConfirmSignUp.mockReset();
    mockedForgotPassword.mockReset();
  },
};
