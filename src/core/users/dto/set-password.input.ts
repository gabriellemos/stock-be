import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class SetPasswordInput {
  @Field(() => ID)
  _id: string;

  @Field()
  secret: string;

  @Field()
  newPassword: string;
}
