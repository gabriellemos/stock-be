import { Field, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Schema as MongoSchema } from 'mongoose';

import { BaseEntity } from 'src/common/entities/base.entity';

import { Position } from './position.entity';
import { OrderType } from '../scalars/order-type.scalar';

@Schema()
@ObjectType()
export class PositionEntry extends BaseEntity {
  @Field(() => GraphQLISODateTime)
  @Prop()
  date: Date;

  @Field()
  @Prop({ required: true, min: 1 })
  quantity: number;

  @Field()
  @Prop({
    enum: Object.values(OrderType),
    required: true,
    type: String,
  })
  type: OrderType;

  @Field()
  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({
    ref: 'Position',
    required: true,
    type: MongoSchema.Types.ObjectId,
  })
  position: Position;
}

export const PositionEntrySchema = SchemaFactory.createForClass(PositionEntry);
export type PositionEntryModel = Model<PositionEntry>;
