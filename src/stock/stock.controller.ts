import { Body, Controller, Post } from '@nestjs/common';

import { StockService } from './stock.service';
import { TrackStockDto } from './dto/track-stock.dto';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  trackStock(@Body() stockDto: TrackStockDto) {
    return this.stockService.trackStock(stockDto);
  }
}
