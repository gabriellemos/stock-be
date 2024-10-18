import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Document, ObjectId } from 'mongoose';

@ObjectType({ isAbstract: true })
export abstract class BaseEntity extends Document<ObjectId> {
  @Field(() => ID)
  _id: ObjectId;
}
