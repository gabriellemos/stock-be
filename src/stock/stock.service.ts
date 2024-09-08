import { Injectable, Inject } from '@nestjs/common';

import type { Sheets } from './sheets.factory';
import { GOOGLE_SHEETS, SPREADSHEET_ID } from './stock.constants';

@Injectable()
export class StockService {
  constructor(
    @Inject(GOOGLE_SHEETS) private sheets: Sheets,
    @Inject(SPREADSHEET_ID) private spreadsheetId: string,
  ) {}

  async getStock(ticket: string): Promise<string> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Sheet1',
    });

    console.log('==== res', res.data.values);
    return `This action returns all coffees for ticket ${ticket}`;
  }
}
