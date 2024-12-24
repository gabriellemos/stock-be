import { MailService } from 'src/core/mail/mail.service';

export type MockedMailService = jest.Mocked<Partial<MailService>> & {
  mockReset: () => void;
  expectNoEmailToBeSent: () => void;
};

export const generateMailService: () => MockedMailService = () => {
  const mockedConfirmSignUp = jest.fn();
  const mockedForgotPassword = jest.fn();

  return {
    confirmSignUp: mockedConfirmSignUp,
    forgotPassword: mockedForgotPassword,

    mockReset: () => {
      mockedConfirmSignUp.mockReset();
      mockedForgotPassword.mockReset();
    },

    expectNoEmailToBeSent: () => {
      expect(mockedConfirmSignUp).not.toHaveBeenCalled();
      expect(mockedForgotPassword).not.toHaveBeenCalled();
    },
  };
};
