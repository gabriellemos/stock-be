import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

export enum GroupInterval {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  TRIMESTER = 'trimester',
  SEMESTER = 'semester',
  YEAR = 'year',
}

@Scalar('GroupInterval', () => GroupInterval)
export class GroupIntervalScalar
  implements CustomScalar<string, GroupInterval>
{
  description = 'day | week | month | trimester | semester | year';

  parseValue(value: string): GroupInterval {
    switch (value) {
      case 'day':
        return GroupInterval.DAY;
      case 'week':
        return GroupInterval.WEEK;
      case 'month':
        return GroupInterval.MONTH;
      case 'trimester':
        return GroupInterval.TRIMESTER;
      case 'semester':
        return GroupInterval.SEMESTER;
      case 'year':
        return GroupInterval.YEAR;
      default:
        throw new Error('Invalid GroupInterval value');
    }
  }

  serialize(value: GroupInterval): string {
    return value.toString();
  }

  parseLiteral(ast: ValueNode): GroupInterval {
    if (ast.kind === Kind.STRING) {
      return this.parseValue(ast.value);
    }
    return null;
  }
}
