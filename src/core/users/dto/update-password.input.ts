import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdatePasswordInput {
  @Field()
  oldPassword: string;

  @Field()
  newPassword: string;
}
