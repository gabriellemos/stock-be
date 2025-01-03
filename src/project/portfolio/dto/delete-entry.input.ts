import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteEntryInput {
  @Field(() => ID)
  _id: string;
}
