import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseEntity } from 'src/common/entities/base.entity';

@Schema()
export class Secret extends BaseEntity {
  @Prop({ required: true })
  key: string;

  @Prop({ type: Date, required: true })
  expriresAt: Date;
}

export const SecretSchema = SchemaFactory.createForClass(Secret);
export type SecretModel = Model<Secret>;
