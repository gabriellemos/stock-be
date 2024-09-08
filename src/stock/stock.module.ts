import { Module } from '@nestjs/common';

import { GOOGLE_SHEETS, SPREADSHEET_ID } from './stock.constants';
import { GoogleSheetsFactory } from './sheets.factory';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  controllers: [StockController],
  providers: [
    StockService,
    GoogleSheetsFactory,
    {
      provide: GOOGLE_SHEETS,
      useFactory: (googleSheetsFactory: GoogleSheetsFactory) => {
        return googleSheetsFactory.create();
      },
      inject: [GoogleSheetsFactory],
    },
    {
      provide: SPREADSHEET_ID,
      useValue: process.env.SPREADSHEET_ID,
    },
  ],
})
export class StockModule {}
