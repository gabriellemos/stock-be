import { LogService } from 'src/core/log/log.service';

export type MockedLogService = jest.Mocked<Partial<LogService>> & {
  mockReset: () => void;
  expectNoLogToBeMade: () => void;
};

export const generateLogService: () => MockedLogService = () => {
  const mockedLogInfo = jest.fn();
  const mockedLogWarn = jest.fn();
  const mockedLogError = jest.fn();

  return {
    logInfo: mockedLogInfo,
    logWarn: mockedLogWarn,
    logError: mockedLogError,

    mockReset: () => {
      mockedLogInfo.mockReset();
      mockedLogWarn.mockReset();
      mockedLogError.mockReset();
    },

    expectNoLogToBeMade: () => {
      expect(mockedLogInfo).not.toHaveBeenCalled();
      expect(mockedLogWarn).not.toHaveBeenCalled();
      expect(mockedLogError).not.toHaveBeenCalled();
    },
  };
};
