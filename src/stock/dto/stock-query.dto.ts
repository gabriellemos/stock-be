import { IsString } from 'class-validator';

export class StockQueryDto {
  @IsString()
  exchange: string;

  @IsString()
  ticket: string;
}
