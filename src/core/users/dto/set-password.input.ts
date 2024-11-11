import { InputType, Field, ID } from '@nestjs/graphql';

import { PasswordScalar } from 'src/core/configure/scalars/password.scalar';

@InputType()
export class SetPasswordInput {
  @Field(() => ID)
  _id: string;

  @Field()
  secret: string;

  @Field(() => PasswordScalar)
  newPassword: string;
}
