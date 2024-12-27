import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class DeletePortfolioInput {
  @Field()
  _id: string;
}
