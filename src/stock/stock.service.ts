import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, ObjectId } from 'mongoose';
import { startOfDay, endOfDay, subDays, isEqual } from 'date-fns';
import { isNaN } from 'lodash';

import { LogService } from 'src/log/log.service';
import { SpreadsheetsService } from 'src/spreadsheets/spreadsheets.service';
import type { HistoryData } from 'src/spreadsheets/spreadsheets.service';

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

  private async createOrUpdateHistoryItem(
    stockId: ObjectId,
    historyData: HistoryData,
  ) {
    // Find history item for given stock and date
    const historyItem = await this.historyItemModel
      .findOne({
        stock: stockId,
        date: {
          $gte: startOfDay(historyData.date),
          $lte: endOfDay(historyData.date),
        },
      })
      .exec();

    if (historyItem) {
      // Update existing history item
      await this.historyItemModel
        .findOneAndUpdate({ _id: historyItem._id }, historyData)
        .exec();
    } else {
      // Create new history item
      await new this.historyItemModel({
        ...historyData,
        stock: stockId,
      }).save();
    }
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
      // Fetch stock history from the spreadsheet (google finance)
      const historyPrices = await this.sheetsService.downloadStockHistory(
        stockName,
        stock.latestDate,
        yesterday,
      );
      historyPrices.forEach(async (historyItem) => {
        // Store information about the stock pricing
        await this.createOrUpdateHistoryItem(stock._id, historyItem);
      });
      const lastDayWithData =
        historyPrices[historyPrices.length - 1]?.date || startOfDay(yesterday);
      if (isEqual(startOfDay(lastDayWithData), startOfDay(yesterday))) {
        stock.latestDate = lastDayWithData;
      } else {
        // This is done to handle the case when the market was closed. When that happens
        // we don't want to keep downloading the same data over and over again.
        stock.latestDate = endOfDay(yesterday);
      }
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

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateStocksPrices() {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedPrices = await this.sheetsService.downloadUpdatedPrices();
      updatedPrices.forEach(async ({ stock: stockName, ...historyItem }) => {
        if (isNaN(historyItem.open)) {
          // No data available. Skip.
          return;
        }

        // Find stock by exchange and ticket. Combination is unique.
        const [exchange, ticket] = stockName.split(':');
        const stock = await this.stockModel
          .findOne({ exchange, ticket })
          .exec();

        if (!stock) {
          // Stock not found. Log and skip.
          this.logService.logError('Stock not found', { stockName });
          return;
        }

        // Store information about the stock pricing
        await this.createOrUpdateHistoryItem(stock._id, historyItem);
      });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      this.logService.logError('Error updating stock prices', { error });
    } finally {
      session.endSession();
    }
  }
}
