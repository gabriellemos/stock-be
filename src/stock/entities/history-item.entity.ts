import { Field, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, ObjectId, Schema as MongoSchema } from 'mongoose';

import { Stock } from './stock.entity';

@Schema()
@ObjectType()
export class HistoryItem extends Document<ObjectId> {
  @Field(() => GraphQLISODateTime)
  @Prop()
  date: Date;

  @Field()
  @Prop()
  open: number;

  @Field()
  @Prop()
  high: number;

  @Field()
  @Prop()
  low: number;

  @Field()
  @Prop()
  close: number;

  @Field()
  @Prop()
  volume: number;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'Stock' })
  stock: Stock;
}

export const HistoryItemSchema = SchemaFactory.createForClass(HistoryItem);
export type HistoryItemModel = Model<HistoryItem>;
