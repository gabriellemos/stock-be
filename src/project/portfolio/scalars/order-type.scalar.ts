import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

export enum OrderType {
  BUY_ORDER = 'Buy',
  SELL_ORDER = 'Sell',
  STOCK_SPLIT = 'Split',
  STOCK_GROUPING = 'Grouping',
  STOCK_SUBSCRIPTION = 'Subscription',
  BONUS_ISSUE = 'Bonus Issue',
}

@Scalar('OrderType', () => OrderType)
export class OrderTypeScalar implements CustomScalar<string, OrderType> {
  description = 'Buy | Sell | Split | Grouping | Subscription | Bonus Issue';

  parseValue(value: string): OrderType {
    if (Object.values(OrderType).find((type) => type === value)) {
      return value as OrderType;
    }
    throw new Error('Invalid OrderType value');
  }

  serialize(value: OrderType): string {
    return value.toString();
  }

  parseLiteral(ast: ValueNode): OrderType {
    if (ast.kind === Kind.STRING) {
      return this.parseValue(ast.value);
    }
    return null;
  }
}
