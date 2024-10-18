import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { join } from 'node:path';

export type Sheets = ReturnType<typeof google.sheets>;

@Injectable()
export class GoogleSheetsFactory {
  async create(): Promise<Sheets> {
    const credentialsPath = join(
      process.cwd(),
      process.env.SERVICE_ACCOUNT_CREDENTIALS,
    );

    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      keyFile: credentialsPath,
    });

    return google.sheets({ version: 'v4', auth });
  }
}
