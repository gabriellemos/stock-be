import { registerAs } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import type { ConfigType } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

const mailConfig = registerAs('mail', () => {
  if (process.env.NODE_ENV === 'test') {
    return {
      transport: { jsonTransport: true },
      defaults: {
        from: `"No Reply" <noreply@example.com>`,
      },
    };
  }

  return {
    transport: {
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    },
    defaults: {
      from: `"Meu Portfólio" <${process.env.MAIL_USERNAME}>`,
    },
    template: {
      dir: __dirname + '/templates',
      adapter: new HandlebarsAdapter(),
      options: { strict: true },
    },
  };
});

export const MailConfigKey = mailConfig.KEY;
export const MailConfigModule = ConfigModule.forFeature(mailConfig);
export type MailConfig = ConfigType<typeof mailConfig>;
