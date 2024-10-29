import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Schema as MongoSchema } from 'mongoose';

import { BaseEntity } from 'src/common/entities/base.entity';
import { Secret } from './secret.entity';

@Schema()
@ObjectType()
export class User extends BaseEntity {
  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'Secret' })
  secret: Secret;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserModel = Model<User>;
