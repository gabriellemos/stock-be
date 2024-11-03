import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import type { User } from '../users/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  private generateKey(userId: string, secret: string) {
    return Buffer.from(`${userId};${secret}`, 'utf8').toString('base64');
  }

  confirmSignUp(user: User, secret: string) {
    const key = this.generateKey(user.id, secret);
    return this.mailerService.sendMail({
      to: user.email,
      subject: '[Meu Portfólio] Confirmação de cadastro',
      template: 'user-confirmation',
      context: {
        'app-link': process.env.FRONTEND_URL,
        'password-link': `${process.env.FRONTEND_URL}/set-password?key=${key}`,
        username: user.name,
      },
    });
  }

  forgotPassword(user: User, secret: string) {
    const key = this.generateKey(user.id, secret);
    return this.mailerService.sendMail({
      to: user.email,
      subject: '[Meu Portfólio] Alterar senha',
      template: 'user-forgot-password',
      context: {
        'app-link': process.env.FRONTEND_URL,
        'password-link': `${process.env.FRONTEND_URL}/forgot-password?key=${key}`,
        username: user.name,
      },
    });
  }
}
