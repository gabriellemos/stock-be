import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class SetPasswordInput {
  @Field(() => ID)
  id: string;

  @Field()
  secret: string;

  @Field()
  newPassword: string;
}
