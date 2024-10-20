import { Field, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';

import { Paginated } from 'src/common/dto/paginated.response';

@ObjectType()
class TimePeriod {
  @Field(() => GraphQLISODateTime)
  from: Date;

  @Field(() => GraphQLISODateTime)
  to: Date;
}

@ObjectType()
export class StockPrice {
  @Field(() => TimePeriod)
  period: TimePeriod;

  @Field()
  open: number;

  @Field()
  high: number;

  @Field()
  low: number;

  @Field()
  close: number;

  @Field()
  volume: number;
}

@ObjectType()
export class PaginatedPrice extends Paginated(StockPrice) {}
