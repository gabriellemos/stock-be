import { Module } from '@nestjs/common';

import { GOOGLE_SHEETS, SPREADSHEET_ID } from './spreadsheets.constants';
import { GoogleSheetsFactory } from './spreadsheets.factory';
import { SpreadsheetsService } from './spreadsheets.service';

@Module({
  providers: [
    SpreadsheetsService,
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
  exports: [SpreadsheetsService],
})
export class SpreadsheetsModule {}
