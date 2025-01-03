import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Schema as MongoSchema } from 'mongoose';

import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/core/users/entities/user.entity';

import { Position } from './position.entity';
import { Entry } from './entry.entity';

@Schema()
@ObjectType()
export class Portfolio extends BaseEntity {
  @Field()
  @Prop({ required: true })
  name: string;

  @Field({ nullable: true })
  @Prop()
  description?: string;

  @Field(() => [Entry])
  entries: Entry[];

  @Field(() => [Position], { description: 'Active positions' })
  positions: Position[];

  @Field(() => User)
  @Prop({
    ref: 'User',
    required: true,
    type: MongoSchema.Types.ObjectId,
  })
  owner: User;
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);
export type PortfolioModel = Model<Portfolio>;
