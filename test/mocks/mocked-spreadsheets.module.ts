import { SpreadsheetsService } from 'src/project/spreadsheets/spreadsheets.service';

type MockedService = jest.Mocked<Partial<SpreadsheetsService>> & {
  mockReset: () => void;
};

export const generateSpreadsheetsService: () => MockedService = () => {
  const mockedDownloadStockHistory = jest.fn();
  const mockedDownloadUpdatedPrices = jest.fn();
  const mockedTrackStock = jest.fn();

  return {
    downloadStockHistory: mockedDownloadStockHistory,
    downloadUpdatedPrices: mockedDownloadUpdatedPrices,
    trackStock: mockedTrackStock,

    mockReset: () => {
      mockedDownloadStockHistory.mockReset();
      mockedDownloadUpdatedPrices.mockReset();
      mockedTrackStock.mockReset();
    },
  };
};
