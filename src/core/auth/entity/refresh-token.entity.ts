import { ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Schema as MongoSchema } from 'mongoose';

import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/core/users/entities/user.entity';

@Schema()
@ObjectType()
export class RefreshToken extends BaseEntity {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: Date, required: true })
  expriresAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
export type RefreshTokenModel = Model<RefreshToken>;
