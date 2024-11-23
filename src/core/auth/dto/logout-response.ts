import { ObjectType, Field } from '@nestjs/graphql';

import { User } from 'src/core/users/entities/user.entity';

@ObjectType()
export class LogoutResponse {
  @Field(() => User)
  user: User;
}
