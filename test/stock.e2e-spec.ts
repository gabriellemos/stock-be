import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import {
  startOfDay,
  subMonths,
  subYears,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
} from 'date-fns';
import { intersection } from 'lodash';
import MockDate from 'mockdate';

import { CommonModule } from 'src/common/common.module';
import { ConfigureModule } from 'src/core/configure/configure.module';
import { SpreadsheetsService } from 'src/project/spreadsheets/spreadsheets.service';
import { LogService } from 'src/core/log/log.service';
import { StockModule } from 'src/project/stock/stock.module';
import { TimeInterval } from 'src/common/scalars/time-interval.scalar';
import { GroupInterval } from 'src/common/scalars/group-interval.scalar';

import Consts from 'test/utils/conts';
import { gqlRequest } from 'test/utils';
import { mockedLogService } from 'test/mocks/mocked-log.module';
import { mockedSpreadsheetsService } from 'test/mocks/mocked-spreadsheets.module';

describe('StockModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, ConfigureModule, StockModule],
    })
      .overrideProvider(LogService)
      .useValue(mockedLogService)
      .overrideProvider(SpreadsheetsService)
      .useValue(mockedSpreadsheetsService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockedLogService.mockReset();
    mockedSpreadsheetsService.mockReset();
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
      const queryStockPriceHistory = `
        query QueryStock($id: ID!, $cursor: DateTime, $groupBy: GroupInterval) {
          stock(id: $id) {
            _id
            prices(groupBy: $groupBy, cursor: $cursor, limit: 5) {
              edges {
                cursor
                node {
                  period {
                    from
                    to
                  }
                  open
                  high
                  low
                  close
                  volume
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `;

      describe('groups prices by ', () => {
        it.each([
          {
            groupBy: GroupInterval.DAY,
            measureWith: differenceInDays,
            expectedValue: 0,
          },
          {
            groupBy: GroupInterval.WEEK,
            measureWith: differenceInWeeks,
            expectedValue: 0,
          },
          {
            groupBy: GroupInterval.MONTH,
            measureWith: differenceInMonths,
            expectedValue: 0,
          },
          {
            cursor: '2024-10-01T19:56:00.000Z',
            groupBy: GroupInterval.TRIMESTER,
            measureWith: differenceInMonths,
            expectedValue: 2,
          },
          {
            cursor: '2024-07-01T19:56:00.000Z',
            groupBy: GroupInterval.SEMESTER,
            measureWith: differenceInMonths,
            expectedValue: 5,
          },
          {
            groupBy: GroupInterval.YEAR,
            measureWith: differenceInYears,
            expectedValue: 0,
          },
        ])(
          '$groupBy',
          async ({ cursor, groupBy, measureWith, expectedValue }) => {
            const response = await gqlRequest(app, queryStockPriceHistory, {
              id: Consts.HGLG11_ID,
              groupBy,
              cursor,
            });

            expect(response.status).toBe(200);
            const { edges: prices } = response.body.data.stock.prices;
            expect(prices).not.toHaveLength(0);

            prices.forEach(({ node: price }) => {
              expect(measureWith(price.period.to, price.period.from)).toBe(
                expectedValue,
              );
            });
          },
        );
      });

      it('paginates results', async () => {
        const response1 = await gqlRequest(app, queryStockPriceHistory, {
          id: Consts.HGLG11_ID,
          groupBy: GroupInterval.DAY,
          cursor: null,
        });

        expect(response1.status).toBe(200);
        const { endCursor } = response1.body.data.stock.prices.pageInfo;

        const response2 = await gqlRequest(app, queryStockPriceHistory, {
          id: Consts.HGLG11_ID,
          groupBy: GroupInterval.DAY,
          cursor: endCursor,
        });

        const prices1 = response1.body.data.stock.prices.edges;
        const prices2 = response2.body.data.stock.prices.edges;

        expect(response2.status).toBe(200);
        expect(intersection(prices1, prices2)).toStrictEqual([]);
      });
    });
  });

  describe('mutation trackStock', () => {
    const trackStockMutation = `
      mutation TrackStock($input: TrackStockInput!) {
        trackStock(input: $input) {
          _id
          ticket
          exchange
          latestDate
          price {
            __typename
          }
          priceHistory {
            __typename
          }
          prices {
            edges {
              __typename
            }
          }
        }
      }
    `;

    beforeEach(() => {
      mockedSpreadsheetsService.trackStock.mockResolvedValue(Promise.resolve());
    });

    it('registers a new stock', async () => {
      const response = await gqlRequest(app, trackStockMutation, {
        input: {
          exchange: 'BVMF',
          ticket: 'ZZZZ11',
        },
      });

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        data: {
          trackStock: {
            _id: expect.any(String),
            ticket: 'ZZZZ11',
            exchange: 'BVMF',
            latestDate: '2000-01-01T02:00:00.000Z',
            price: null,
            priceHistory: [],
            prices: { edges: [] },
          },
        },
      });
    });

    it('throws error if it already exists', async () => {
      const response = await gqlRequest(app, trackStockMutation, {
        input: {
          exchange: 'BVMF',
          ticket: 'ALZR11',
        },
      });

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        errors: [
          expect.objectContaining({
            message: 'Stock already tracked: BVMF:ALZR11',
          }),
        ],
        data: null,
      });
    });

    it('adds stock to tracking list', async () => {
      mockedSpreadsheetsService.trackStock.mockResolvedValue(Promise.resolve());
      const response = await gqlRequest(app, trackStockMutation, {
        input: {
          exchange: 'BVMF',
          ticket: 'XXXX11',
        },
      });

      expect(response.status).toBe(200);
      expect(mockedSpreadsheetsService.trackStock).toHaveBeenCalledTimes(1);
      expect(mockedSpreadsheetsService.trackStock).toHaveBeenCalledWith(
        'BVMF:XXXX11',
      );
    });
  });

  describe('download history', () => {});
  describe('download updated prices', () => {});
});
