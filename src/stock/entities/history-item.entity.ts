import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, ObjectId, Schema as MongoSchema } from 'mongoose';

import { Stock } from './stock.entity';

@Schema()
export class HistoryItem extends Document<ObjectId> {
  @Prop()
  date: Date;

  @Prop()
  open: number;

  @Prop()
  high: number;

  @Prop()
  low: number;

  @Prop()
  close: number;

  @Prop()
  volume: number;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'Stock' })
  stock: Stock;
}

export const HistoryItemSchema = SchemaFactory.createForClass(HistoryItem);
export type HistoryItemModel = Model<HistoryItem>;
