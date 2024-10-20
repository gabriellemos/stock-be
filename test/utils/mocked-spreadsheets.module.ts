import { ValueProvider } from '@nestjs/common/interfaces/modules/provider.interface';

import { SpreadsheetsModule } from 'src/spreadsheets/spreadsheets.module';
import { SpreadsheetsService } from 'src/spreadsheets/spreadsheets.service';

type MockType = jest.Mocked<Partial<SpreadsheetsService>> & {
  mockReset: () => void;
};

const mockedDownloadStockHistory = jest.fn();
const mockedDownloadUpdatedPrices = jest.fn();
const mockedTrackStock = jest.fn();

export const mockedSpreadsheetsService: MockType = {
  downloadStockHistory: mockedDownloadStockHistory,
  downloadUpdatedPrices: mockedDownloadUpdatedPrices,
  trackStock: mockedTrackStock,

  mockReset: () => {
    mockedDownloadStockHistory.mockReset();
    mockedDownloadUpdatedPrices.mockReset();
    mockedTrackStock.mockReset();
  },
};

export const mockedSpreadsheetsModule: ValueProvider = {
  provide: SpreadsheetsModule,
  useValue: mockedSpreadsheetsService,
};
