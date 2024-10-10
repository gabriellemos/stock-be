import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, ObjectId } from 'mongoose';

@Schema()
export class Stock extends Document<ObjectId> {
  @Prop({ required: true })
  ticket: string;

  @Prop({ required: true })
  exchange: string;

  @Prop({ default: () => new Date('2000-1-1') })
  latestDate: Date;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
export type StockModel = Model<Stock>;

StockSchema.index({ ticket: 1, exchange: 1 }, { unique: true });
