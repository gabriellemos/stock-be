import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

export enum StockStatus {
  LOADED = 'loaded',
  PENDING = 'pending',
  INVALID = 'invalid',
}

@Schema()
export class Stock extends Document {
  @Prop({ required: true })
  ticket: string;

  @Prop({ required: true })
  exchange: string;

  @Prop({ type: String, enum: StockStatus, default: StockStatus.PENDING })
  status: StockStatus;

  @Prop()
  name: string;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
export type StockModel = Model<Stock>;

StockSchema.index({ ticket: 1, exchange: 1 }, { unique: true });
