import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SpreadsheetsService } from 'src/spreadsheets/spreadsheets.service';

import { StockQueryDto } from './dto/stock-query.dto';
import { Stock } from './entities/stock.entity';

@Injectable()
export class StockService {
  constructor(
    @Inject() private readonly spreadsheetsService: SpreadsheetsService,
    @InjectModel(Stock.name) private stockModel: Model<Stock>,
  ) {}

  async findOrRegisterStock(stockQuery: StockQueryDto) {
    let stock = await this.stockModel.findOne({ ...stockQuery }).exec();

    if (!stock) {
      const newStock = new this.stockModel(stockQuery);
      stock = await newStock.save();
    }

    return stock;
  }
}
