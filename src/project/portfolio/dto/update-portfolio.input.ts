import { InputType, Field, PartialType } from '@nestjs/graphql';

import { CreatePortfolioInput } from './create-portfolio.input';

@InputType()
export class UpdatePortfolioInput extends PartialType(CreatePortfolioInput) {
  @Field()
  _id: string;
}
