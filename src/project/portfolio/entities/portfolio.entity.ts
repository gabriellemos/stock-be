import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseEntity } from 'src/common/entities/base.entity';

import { Position } from './position.entity';

@Schema()
@ObjectType()
export class Portfolio extends BaseEntity {
  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true })
  description: string;

  @Field(() => [Position], { description: 'Active positions' })
  positions: Position[];
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);
export type PortfolioModel = Model<Portfolio>;
