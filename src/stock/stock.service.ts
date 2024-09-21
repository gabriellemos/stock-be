import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { startOfDay, subDays } from 'date-fns';

import { LogService } from 'src/log/log.service';
import { SpreadsheetsService } from 'src/spreadsheets/spreadsheets.service';

import { TrackStockDto } from './dto/track-stock.dto';
import { HistoryItem } from './entities/history-item.entity';
import { Stock } from './entities/stock.entity';

@Injectable()
export class StockService {
  constructor(
    @Inject() private readonly logService: LogService,
    @InjectConnection() private readonly connection: Connection,
    @Inject() private readonly sheetsService: SpreadsheetsService,
    @InjectModel(HistoryItem.name) private historyItemModel: Model<HistoryItem>,
    @InjectModel(Stock.name) private stockModel: Model<Stock>,
  ) {}

  async trackStock(stockDto: TrackStockDto) {
    const stockName = `${stockDto.exchange}:${stockDto.ticket}`;
    if (!!(await this.stockModel.findOne({ ...stockDto }).exec())) {
      throw new BadRequestException(`Stock already tracked: ${stockName}`);
    }

    await this.sheetsService.trackStock(stockName);
    return new this.stockModel(stockDto).save();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async downloadStockHistory() {
    const yesterday = subDays(new Date(), 1);
    const [stock] = await this.stockModel
      .find({ latestDate: { $lt: startOfDay(yesterday) } })
      .exec();

    if (!stock) {
      return;
    }

    const stockName = `${stock.exchange}:${stock.ticket}`;
    const session = await this.connection.startSession();
    session.startTransaction();

    const logInfo = { stockName, from: stock.latestDate, to: yesterday };
    this.logService.logInfo('Downloading stock history', logInfo);

    try {
      const historyPrices = await this.sheetsService.downloadStockHistory(
        stockName,
        stock.latestDate,
        yesterday,
      );
      historyPrices.forEach((historyItem) => {
        new this.historyItemModel({ ...historyItem, stock }).save();
      });
      stock.latestDate = historyPrices[historyPrices.length - 1].date;
      stock.save();
      await session.commitTransaction();
      this.logService.logInfo('Stock history downloaded', logInfo);
    } catch (error) {
      await session.abortTransaction();
      this.logService.logError('Error downloading stock history', {
        ...logInfo,
        error,
      });
      stock.save();
    } finally {
      session.endSession();
    }
  }
}
