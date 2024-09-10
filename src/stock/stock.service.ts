import { Injectable, Inject } from '@nestjs/common';

import { SpreadsheetsService } from 'src/spreadsheets/spreadsheets.service';

@Injectable()
export class StockService {
  constructor(
    @Inject() private readonly spreadsheetsService: SpreadsheetsService,
  ) {}

  async getStock(ticket: string) {
    return await this.spreadsheetsService.downloadStockHistory(ticket);
  }
}
