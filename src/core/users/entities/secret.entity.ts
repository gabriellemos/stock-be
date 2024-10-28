import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseEntity } from 'src/common/entities/base.entity';

@Schema()
export class Secret extends BaseEntity {
  @Prop({ required: true })
  key: string;

  @Prop({ type: Date, required: true })
  expriresAt: Date;
}

export type SecretDocument = Secret & Document;
export const SecretSchema = SchemaFactory.createForClass(Secret);
