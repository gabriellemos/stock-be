import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { MailService } from './mail.service';

const { MAIL_USERNAME, MAIL_PASSWORD } = process.env;

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: MAIL_USERNAME, // TODO: uptade to env value
          pass: MAIL_PASSWORD, // TODO: uptade to env value
        },
      },
      defaults: {
        from: `"Meu Portfólio" <${MAIL_USERNAME}>`,
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
