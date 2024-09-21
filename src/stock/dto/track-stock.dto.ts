import { IsString } from 'class-validator';

export class TrackStockDto {
  @IsString()
  exchange: string;

  @IsString()
  ticket: string;
}
