import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { startOfDay } from 'date-fns';

import { CommonModule } from 'src/common/common.module';
import { ConfigureModule } from 'src/configure/configure.module';
import { StockModule } from 'src/stock/stock.module';

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
      const queryStock = `
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
        const response = await gqlRequest(app, queryStock, {
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
        const response = await gqlRequest(app, queryStock, {
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
      it.todo('returns prices in given period');
      it.todo('returns all matching records if bellow limit');
      describe('returns a sample from the list when the limit is reached', () => {
        it.todo('includes the earliest record');
        it.todo('includes the oldest record');
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
