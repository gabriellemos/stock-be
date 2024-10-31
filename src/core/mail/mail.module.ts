import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

import { MailConfigModule, MailConfigKey, MailConfig } from './mail.config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailConfigModule,
    MailerModule.forRootAsync({
      imports: [MailConfigModule],
      inject: [MailConfigKey],
      useFactory: (mailConfig: MailConfig) => mailConfig,
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
