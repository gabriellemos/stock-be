import { LogService } from 'src/core/log/log.service';

type MockType = jest.Mocked<Partial<LogService>> & { mockReset: () => void };

const mockedLogInfo = jest.fn();
const mockedLogWarn = jest.fn();
const mockedLogError = jest.fn();

export const mockedLogService: MockType = {
  logInfo: mockedLogInfo,
  logWarn: mockedLogWarn,
  logError: mockedLogError,

  mockReset: () => {
    mockedLogInfo.mockReset();
    mockedLogError.mockReset();
  },
};
