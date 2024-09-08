import { Controller, Get, Param } from '@nestjs/common';

import { StockService } from './stock.service';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get(':ticket')
  getStock(@Param('ticket') ticket: string) {
    return this.stockService.getStock(ticket);
  }
}
