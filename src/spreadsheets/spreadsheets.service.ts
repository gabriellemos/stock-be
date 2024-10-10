import { Injectable, Inject } from '@nestjs/common';
import { isEqual } from 'lodash';
import { format } from 'date-fns';

import type { Sheets } from './spreadsheets.factory';
import { GOOGLE_SHEETS, SPREADSHEET_ID } from './spreadsheets.constants';

@Injectable()
export class SpreadsheetsService {
  constructor(
    @Inject(GOOGLE_SHEETS) private sheets: Sheets,
    @Inject(SPREADSHEET_ID) private spreadsheetId: string,
  ) {}

  private formatSheetDate(date: Date): string {
    const SHEET_DATE_FORMAT = "'DATE('yyyy, MM, dd')'";
    return format(date, SHEET_DATE_FORMAT);
  }

  async downloadStockHistory(ticket: string, startDate: Date, endDate: Date) {
    const start = this.formatSheetDate(startDate);
    const today = this.formatSheetDate(endDate);

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [ticket, `=${start}`, `=${today}`],
          [`=GOOGLEFINANCE("${ticket}", "all", ${start}, ${today})`],
        ],
      },
    });

    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Sheet1',
    });

    const [queryData, headers, ...history] = res.data.values;
    const expectedHeaders = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'];

    if (!queryData || queryData[0] !== ticket) {
      const message = `Data conflict: ticket mismatch. Expected ${ticket}, got ${queryData}`;
      throw new Error(message);
    } else if (!isEqual(headers, expectedHeaders)) {
      // Data is not available for requested dates, return an empty array. This
      // usually on days that the market is closed (weekends and/or hollidays).
      if (isEqual(headers, ['#N/A'])) {
        return [];
      }
      throw new Error('Data conflict: header mismatch');
    }

    return (history as string[][]).map(
      ([date, open, high, low, close, volume]) => ({
        date: new Date(date),
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        volume: parseInt(volume, 10),
      }),
    );
  }

  async trackStock(ticket: string) {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Sheet2',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            ticket,
            `=GOOGLEFINANCE("${ticket}", "tradetime")`,
            `=GOOGLEFINANCE("${ticket}", "priceopen")`,
            `=GOOGLEFINANCE("${ticket}", "high")`,
            `=GOOGLEFINANCE("${ticket}", "low")`,
            `=GOOGLEFINANCE("${ticket}", "price")`,
            `=GOOGLEFINANCE("${ticket}", "volume")`,
          ],
        ],
      },
    });
  }

  async downloadUpdatedPrices() {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Sheet2',
    });

    return (
      (res.data.values as string[][])?.map(
        ([stock, date, open, high, low, close, volume]) => ({
          stock,
          date: new Date(date),
          open: parseFloat(open),
          high: parseFloat(high),
          low: parseFloat(low),
          close: parseFloat(close),
          volume: parseInt(volume, 10),
        }),
      ) ?? []
    );
  }
}

export type HistoryData = Awaited<
  ReturnType<SpreadsheetsService['downloadStockHistory']>
>[number];
