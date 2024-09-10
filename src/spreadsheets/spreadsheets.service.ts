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

  private formatSheetDate(date?: string): string {
    const SHEET_DATE_FORMAT = "'DATE('yyyy, MM, dd')'";
    return format(date ? new Date(date) : new Date(), SHEET_DATE_FORMAT);
  }

  async downloadStockHistory(ticket: string) {
    const start = this.formatSheetDate('2024-1-1');
    const today = this.formatSheetDate();

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
      throw new Error('Data conflict: ticket mismatch');
    } else if (!isEqual(headers, expectedHeaders)) {
      throw new Error('Data conflict: header mismatch');
    }

    // handle history and store locally
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
}
