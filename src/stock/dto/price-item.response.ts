import { Field, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
class TimePeriod {
  @Field(() => GraphQLISODateTime)
  from: Date;

  @Field(() => GraphQLISODateTime)
  to: Date;
}

@ObjectType()
export class PriceItem {
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
