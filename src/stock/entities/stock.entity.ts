import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

enum StockStatus {
  LOADED = 'loaded',
  LOADING = 'loading',
  INVALID = 'invalid',
}

@Schema()
export class Stock extends Document {
  @Prop({ required: true })
  ticket: string;

  @Prop({ required: true })
  exchange: string;

  @Prop({ type: String, enum: StockStatus, default: StockStatus.LOADING })
  status: StockStatus;

  @Prop()
  name: string;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
export type StockModel = Model<Stock>;

StockSchema.index({ ticket: 1, exchange: 1 }, { unique: true });
