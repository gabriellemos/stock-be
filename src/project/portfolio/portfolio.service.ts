import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { LogService } from 'src/core/log/log.service';

import { Portfolio } from './entities/portfolio.entity';
import { PositionEntry } from './entities/position-entry.entity';
import { Position } from './entities/position.entity';

@Injectable()
export class PortfolioService {
  constructor(
    @Inject() private readonly logService: LogService,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Portfolio.name) private portfolioModel: Model<Portfolio>,
    @InjectModel(PositionEntry.name)
    private positionEntryModel: Model<PositionEntry>,
    @InjectModel(Position.name) private positionModel: Model<Position>,
  ) {}

  async findById(id: string) {
    const portfolio = await this.portfolioModel.findById(id);
    if (!portfolio) throw new NotFoundException(`Portfolio not found: ${id}`);
    return portfolio;
  }
}
