import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  confirmSignUp(email: string, username: string, link: string) {
    return this.mailerService.sendMail({
      to: email,
      subject: '[Meu Portfólio] Confirmação de cadastro',
      template: 'user-confirmation',
      context: {
        'app-link': process.env.FRONTEND_URL,
        'password-link': link,
        username,
      },
    });
  }

  forgotPassword(email: string, username: string, link: string) {
    return this.mailerService.sendMail({
      to: email,
      subject: '[Meu Portfólio] Alterar senha',
      template: 'user-forgot-password',
      context: {
        'app-link': process.env.FRONTEND_URL,
        'password-link': link,
        username,
      },
    });
  }
}
