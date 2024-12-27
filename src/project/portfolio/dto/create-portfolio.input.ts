import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreatePortfolioInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description: string;
}
