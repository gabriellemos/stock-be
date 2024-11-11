import { InputType, Field } from '@nestjs/graphql';

import { PasswordScalar } from '../scalars/password.scalar';

@InputType()
export class UpdatePasswordInput {
  @Field()
  oldPassword: string;

  @Field(() => PasswordScalar)
  newPassword: string;
}
