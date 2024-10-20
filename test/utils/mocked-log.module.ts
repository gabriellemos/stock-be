import { ValueProvider } from '@nestjs/common/interfaces/modules/provider.interface';

import { LogModule } from 'src/log/log.module';
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

export const mockedLogModule: ValueProvider = {
  provide: LogModule,
  useValue: mockedLogService,
};
