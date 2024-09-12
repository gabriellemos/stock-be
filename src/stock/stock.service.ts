import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Inject } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { SpreadsheetsService } from 'src/spreadsheets/spreadsheets.service';

import { StockQueryDto } from './dto/stock-query.dto';
import { HistoryItem } from './entities/history-item.entity';
import { Stock, StockStatus } from './entities/stock.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @Inject() private readonly sheetsService: SpreadsheetsService,
    @InjectModel(HistoryItem.name) private historyItemModel: Model<HistoryItem>,
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

  @Cron(CronExpression.EVERY_MINUTE)
  async downloadStockHistory() {
    const [stock] = await this.stockModel
      .find({ status: StockStatus.PENDING })
      .exec();

    if (!stock) {
      return;
    }

    const fullName = `${stock.exchange}:${stock.ticket}`;
    const session = await this.connection.startSession();
    // TODO: Log event: donwloading stock history for ${fullName}
    session.startTransaction();
    try {
      (await this.sheetsService.downloadStockHistory(fullName)).forEach(
        (historyItem) => {
          new this.historyItemModel({ ...historyItem, stock }).save();
        },
      );
      stock.status = StockStatus.LOADED;
      stock.save();
      // TODO: Log event: donwload successful
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      // TODO: Log event: donwload failed
      console.error('Error downloading stock history:', error);
      stock.status = StockStatus.INVALID;
      stock.save();
    } finally {
      session.endSession();
    }
  }
}
