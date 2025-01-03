import { Field, ObjectType, GraphQLISODateTime, Float } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Schema as MongoSchema } from 'mongoose';

import { BaseEntity } from 'src/common/entities/base.entity';

import { Position } from './position.entity';
import { Portfolio } from './portfolio.entity';
import { OrderType } from '../scalars/order-type.scalar';

@Schema()
@ObjectType()
export class Entry extends BaseEntity {
  @Field(() => GraphQLISODateTime)
  @Prop()
  date: Date;

  @Field()
  @Prop({ required: true, min: 1 })
  quantity: number;

  @Field(() => OrderType)
  @Prop({
    enum: Object.values(OrderType),
    required: true,
    type: String,
  })
  type: OrderType;

  @Field(() => Float)
  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({
    ref: 'Portfolio',
    required: true,
    type: MongoSchema.Types.ObjectId,
  })
  portfolio: Portfolio;

  @Prop({
    ref: 'Position',
    required: true,
    type: MongoSchema.Types.ObjectId,
  })
  position: Position;
}

export const EntrySchema = SchemaFactory.createForClass(Entry);
export type EntryModel = Model<Entry>;
