import { Field, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseEntity } from 'src/common/entities/base.entity';

@Schema()
@ObjectType()
export class Stock extends BaseEntity {
  @Field()
  @Prop({ required: true })
  ticket: string;

  @Field()
  @Prop({ required: true })
  exchange: string;

  @Field(() => GraphQLISODateTime)
  @Prop({ default: () => new Date('2000-1-1') })
  latestDate: Date;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
export type StockModel = Model<Stock>;

StockSchema.index({ ticket: 1, exchange: 1 }, { unique: true });
