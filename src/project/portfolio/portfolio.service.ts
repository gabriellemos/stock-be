import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { LogService } from 'src/core/log/log.service';
import { UsersService } from 'src/core/users/users.service';

import { Portfolio } from './entities/portfolio.entity';
import { PositionEntry } from './entities/position-entry.entity';
import { Position } from './entities/position.entity';
import { CreatePortfolioInput } from './dto/create-portfolio.input';
import { UpdatePortfolioInput } from './dto/update-portfolio.input';
import { DeletePortfolioInput } from './dto/delete-portfolio.input';

@Injectable()
export class PortfolioService {
  constructor(
    @Inject() private readonly logService: LogService,
    @Inject() private readonly usersService: UsersService,
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

  async findByOwner(id: string) {
    return await this.portfolioModel.find({ owner: id }).exec();
  }

  async create(ownerId: string, input: CreatePortfolioInput) {
    const owner = await this.usersService.findById(ownerId);
    return await new this.portfolioModel({
      ...input,
      owner,
    }).save();
  }

  async update({ _id, ...input }: UpdatePortfolioInput) {
    return await this.portfolioModel.findByIdAndUpdate(_id, input, {
      new: true,
    });
  }

  async delete({ _id }: DeletePortfolioInput) {
    return await this.portfolioModel.findOneAndDelete({ _id });
  }
}
