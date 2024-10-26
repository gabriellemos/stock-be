import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class TrackStockInput {
  @Field(() => String)
  exchange: string;

  @Field(() => String)
  ticket: string;
}
