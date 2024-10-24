import { LogService } from 'src/log/log.service';

type MockType = jest.Mocked<Partial<LogService>> & { mockReset: () => void };

const mockedLogInfo = jest.fn();
const mockedLogError = jest.fn();

export const mockedLogService: MockType = {
  logInfo: mockedLogInfo,
  logError: mockedLogError,

  mockReset: () => {
    mockedLogInfo.mockReset();
    mockedLogError.mockReset();
  },
};
