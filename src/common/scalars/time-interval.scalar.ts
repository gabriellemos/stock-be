import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

export enum TimeInterval {
  ONE_MONTH = '1m',
  ONE_YEAR = '1y',
  FIVE_YEARS = '5y',
  MAX = 'max',
}

@Scalar('TimeInterval', () => TimeInterval)
export class TimeIntervalScalar implements CustomScalar<string, TimeInterval> {
  description = '1m | 1y | 5y | max';

  parseValue(value: string): TimeInterval {
    switch (value) {
      case '1m':
        return TimeInterval.ONE_MONTH;
      case '1y':
        return TimeInterval.ONE_YEAR;
      case '5y':
        return TimeInterval.FIVE_YEARS;
      case 'max':
        return TimeInterval.MAX;
      default:
        throw new Error('Invalid TimeInterval value');
    }
  }

  serialize(value: TimeInterval): string {
    return value.toString();
  }

  parseLiteral(ast: ValueNode): TimeInterval {
    if (ast.kind === Kind.STRING) {
      return this.parseValue(ast.value);
    }
    return null;
  }
}
