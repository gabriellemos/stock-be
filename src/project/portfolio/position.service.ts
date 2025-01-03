import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { LogService } from 'src/core/log/log.service';
import { StockService } from 'src/project/stock/stock.service';
import { PortfolioService } from 'src/project/portfolio/portfolio.service';

import { CreateEntryInput } from './dto/create-entry.input';
import { DeleteEntryInput } from './dto/delete-entry.input';
import { Entry } from './entities/entry.entity';
import { Position } from './entities/position.entity';

@Injectable()
export class PositionService {
  constructor(
    @Inject() private readonly logService: LogService,
    @Inject() private readonly stockService: StockService,
    @Inject() private readonly portfolioService: PortfolioService,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Position.name) private positionModel: Model<Position>,
    @InjectModel(Entry.name) private entryModel: Model<Entry>,
  ) {}

  async findById(id: string) {
    const position = await this.positionModel.findById(id);
    if (!position) throw new NotFoundException(`Position not found: ${id}`);
    return position;
  }

  async registerEntry({ stockId, portfolioId, ...input }: CreateEntryInput) {
    const portfolio = await this.portfolioService.findById(portfolioId);
    const stock = await this.stockService.findById(stockId);

    return new this.entryModel({ ...input, stock, portfolio }).save();
  }

  async deleteEntry({ _id }: DeleteEntryInput) {
    return this.entryModel.findOneAndDelete({ _id });
  }
}
