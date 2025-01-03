import {
  Field,
  Float,
  GraphQLISODateTime,
  ID,
  InputType,
  Int,
} from '@nestjs/graphql';

import { OrderType } from '../scalars/order-type.scalar';

@InputType()
export class CreateEntryInput {
  @Field(() => GraphQLISODateTime)
  date: Date;

  @Field(() => Int)
  quantity: number;

  @Field(() => OrderType)
  type: OrderType;

  @Field(() => Float)
  price: string;

  @Field(() => ID)
  portfolioId: string;

  @Field(() => ID)
  stockId: string;
}
