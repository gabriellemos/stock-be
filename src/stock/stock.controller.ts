import { Controller, Get, Query } from '@nestjs/common';

import { StockService } from './stock.service';
import { StockQueryDto } from './dto/stock-query.dto';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  findStock(@Query() stockQuery: StockQueryDto) {
    return this.stockService.findOrRegisterStock(stockQuery);
  }
}
