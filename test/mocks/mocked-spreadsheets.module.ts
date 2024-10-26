import { SpreadsheetsService } from 'src/project/spreadsheets/spreadsheets.service';

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
