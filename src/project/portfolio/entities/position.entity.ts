import { Field, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Schema as MongoSchema } from 'mongoose';

import { BaseEntity } from 'src/common/entities/base.entity';
import { Stock } from 'src/project/stock/entities/stock.entity';

import { Entry } from './entry.entity';
import { Portfolio } from './portfolio.entity';

@Schema()
@ObjectType()
export class Position extends BaseEntity {
  @Field(() => GraphQLISODateTime)
  @Prop({ required: true })
  open: Date;

  @Field(() => GraphQLISODateTime)
  @Prop()
  close: Date;

  @Field()
  @Prop({ required: true })
  quantity: number;

  // Used to calculate the average price of the position. This value is not
  // update when a sell order is made.
  @Prop({ required: true })
  totalQuantity: number;

  // Used to calculate the average price of the position. Total cost of the
  // position. This value is not updated when a sell order is made.
  @Prop({ required: true })
  volume: number;

  @Field()
  averagePrice: number;

  @Field()
  isOpen: boolean;

  @Prop({
    ref: 'Stock',
    required: true,
    type: MongoSchema.Types.ObjectId,
  })
  stock: Stock;

  @Prop({
    ref: 'Portfolio',
    required: true,
    type: MongoSchema.Types.ObjectId,
  })
  portfolio: Portfolio;

  @Field(() => [Entry])
  entries: Entry[];
}

export const PositionSchema = SchemaFactory.createForClass(Position);
export type PositionModel = Model<Position>;
