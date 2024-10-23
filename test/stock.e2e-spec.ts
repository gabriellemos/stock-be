import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { startOfDay, subMonths, subYears } from 'date-fns';
import MockDate from 'mockdate';

import { CommonModule } from 'src/common/common.module';
import { ConfigureModule } from 'src/configure/configure.module';
import { StockModule } from 'src/stock/stock.module';
import { TimeInterval } from 'src/common/scalars/time-interval.scalar';

import Consts from 'test/utils/conts';
import { gqlRequest } from 'test/utils';
import { mockedLogModule } from 'test/mocks/mocked-log.module';
import { mockedSpreadsheetsModule } from 'test/mocks/mocked-spreadsheets.module';

describe('StockModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, ConfigureModule, StockModule],
      providers: [mockedLogModule, mockedSpreadsheetsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('query stock', () => {
    const queryStock = `
      query QueryStock($id: ID!) {
        stock(id: $id) {
          _id
          ticket
          exchange
        }
      }
    `;

    it('returns stock by id', async () => {
      const response = await gqlRequest(app, queryStock, {
        id: Consts.ALZR11_ID,
      });

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        data: {
          stock: {
            _id: Consts.ALZR11_ID,
            ticket: 'ALZR11',
            exchange: 'BVMF',
          },
        },
      });
    });

    it('throws error if stock not found', async () => {
      const response = await gqlRequest(app, queryStock, {
        id: '670748530b188ce295c22928', // unexisting id
      });

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        errors: [
          expect.objectContaining({
            message: 'Stock with id 670748530b188ce295c22928 not found',
          }),
        ],
        data: null,
      });
    });

    describe('price resolver', () => {
      const queryStockPrice = `
        query QueryStock($id: ID!) {
          stock(id: $id) {
            _id
            price {
              date
              open
              high
              low
              close
              volume
            }
          }
        }
      `;

      it('returns last known price', async () => {
        const response = await gqlRequest(app, queryStockPrice, {
          id: Consts.ALZR11_ID,
        });

        const { price } = response.body.data.stock;
        expect(response.status).toBe(200);
        expect(price).toStrictEqual({
          date: expect.any(String),
          open: expect.any(Number),
          high: expect.any(Number),
          low: expect.any(Number),
          close: expect.any(Number),
          volume: expect.any(Number),
        });
        expect(startOfDay(new Date(price.date)).getTime()).toBeLessThan(
          startOfDay(new Date()).getTime(),
        );
      });

      it('returns null if stock has no price history', async () => {
        // Based on the seed provided, KNCR11 has no price history
        const response = await gqlRequest(app, queryStockPrice, {
          id: Consts.KNCR11_ID,
        });

        expect(response.status).toBe(200);
        expect(response.body.data.stock).toStrictEqual({
          _id: Consts.KNCR11_ID,
          price: null,
        });
      });
    });

    describe('price history resolver', () => {
      const mockedDate = startOfDay(new Date('2024-10-21T19:56:00Z'));
      const queryStockPriceHistory = `
        query QueryStock($id: ID!, $period: TimeInterval) {
          stock(id: $id) {
            _id
            priceHistory(period: $period) {
              date
              open
              high
              low
              close
              volume
            }
          }
        }
      `;

      beforeEach(() => {
        MockDate.set(mockedDate);
      });

      afterEach(() => {
        MockDate.reset();
      });

      describe('returns prices in given period', () => {
        it.each([
          { period: TimeInterval.ONE_MONTH, date: subMonths(mockedDate, 1) },
          { period: TimeInterval.ONE_YEAR, date: subYears(mockedDate, 1) },
          { period: TimeInterval.FIVE_YEARS, date: subYears(mockedDate, 5) },
          { period: TimeInterval.MAX, date: new Date(0) },
        ])('$period', async ({ period, date }) => {
          const response = await gqlRequest(app, queryStockPriceHistory, {
            id: Consts.HGLG11_ID,
            period,
          });

          expect(response.status).toBe(200);
          const { priceHistory } = response.body.data.stock;
          expect(priceHistory).not.toHaveLength(0);

          priceHistory.forEach((price, index) => {
            // Check if date is within given interval (one month)
            expect(date.getTime()).toBeLessThan(new Date(price.date).getTime());
            if (index > 0) {
              // Check if price history is ordered (oldest first)
              const previous = priceHistory[index - 1];
              expect(new Date(previous.date).getTime()).toBeLessThan(
                new Date(price.date).getTime(),
              );
            }
          });
        });
      });

      it('returns at most 300 items', async () => {
        // Based on the seed, HGLG11 has data starting at 2011-04-19 totaling 3205 records.
        const response = await gqlRequest(app, queryStockPriceHistory, {
          id: Consts.HGLG11_ID,
          period: TimeInterval.ONE_MONTH,
        });

        expect(response.status).toBe(200);
        const { priceHistory } = response.body.data.stock;
        expect(priceHistory).not.toHaveLength(300);
      });

      describe('returns a sample from the list when the limit is reached', () => {
        it('includes the earliest record', async () => {
          const response = await gqlRequest(app, queryStockPriceHistory, {
            id: Consts.HGLG11_ID,
            period: TimeInterval.ONE_MONTH,
          });

          expect(response.status).toBe(200);
          const { priceHistory } = response.body.data.stock;
          expect(priceHistory).not.toHaveLength(0);

          // Most recent date stored in the seed is 2024-10-18 (friday)
          const expectedDate = new Date('2024-10-18T19:56:00Z');
          const { date } = priceHistory[priceHistory.length - 1];
          const dateToCheck = startOfDay(new Date(date));

          expect(dateToCheck.getTime()).toBe(
            startOfDay(expectedDate).getTime(),
          );
        });

        it('includes the oldest record', async () => {
          const response = await gqlRequest(app, queryStockPriceHistory, {
            id: Consts.HGLG11_ID,
            period: TimeInterval.ONE_MONTH,
          });

          expect(response.status).toBe(200);
          const { priceHistory } = response.body.data.stock;
          expect(priceHistory).not.toHaveLength(0);

          const { date } = priceHistory[0];
          const dateToCheck = startOfDay(new Date(date));
          const expectedDate = new Date('2024-09-23T19:56:00Z');

          expect(dateToCheck.getTime()).toBe(
            startOfDay(expectedDate).getTime(),
          );
        });
      });
    });

    describe('prices resolver', () => {
      it.todo('groups prices by day');
      it.todo('groups prices by week');
      it.todo('groups prices by month');
      it.todo('groups prices by trimester');
      it.todo('groups prices by semester');
      it.todo('groups prices by year');
      it.todo('paginates results');
    });
  });

  describe('mutation trackStock', () => {
    it.todo('registers a new stock');
    it.todo('throws error if it already exists');
    it.todo('adds stock to tracking list');
  });

  describe('download history', () => {});
  describe('download updated prices', () => {});
});
