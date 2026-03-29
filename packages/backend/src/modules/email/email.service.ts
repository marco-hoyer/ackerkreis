import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      auth: this.configService.get('SMTP_USER')
        ? {
            user: this.configService.get('SMTP_USER'),
            pass: this.configService.get('SMTP_PASS'),
          }
        : undefined,
    });
  }

  async sendMagicLinkEmail(email: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM') || 'noreply@solawi-manager.local',
      to: email,
      subject: 'Dein Login-Code fuer Solawi Manager',
      html: `
        <h2>Dein Login-Code</h2>
        <p>Verwende diesen Code, um dich anzumelden:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; font-family: monospace;">${code}</h1>
        <p>Der Code ist 15 Minuten gueltig.</p>
        <p>Falls du diese E-Mail nicht angefordert hast, kannst du sie ignorieren.</p>
      `,
    });
  }

  async sendApplicationConfirmation(email: string, name: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM') || 'noreply@solawi-manager.local',
      to: email,
      subject: 'Deine Bewerbung bei der Solawi',
      html: `
        <h2>Hallo ${name},</h2>
        <p>vielen Dank fuer deine Bewerbung bei unserer Solawi!</p>
        <p>Wir werden deine Bewerbung pruefen und uns bei dir melden.</p>
        <p>Liebe Gruesse,<br>Dein Solawi-Team</p>
      `,
    });
  }

  async sendBlogPublishedNotification(emails: string[], title: string, slug: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';

    for (const email of emails) {
      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM') || 'noreply@solawi-manager.local',
        to: email,
        subject: `Neuer Blog-Beitrag: ${title}`,
        html: `
          <h2>Neuer Blog-Beitrag</h2>
          <p>Es gibt einen neuen Beitrag in unserem Blog:</p>
          <h3>${title}</h3>
          <p><a href="${frontendUrl}/blog/${slug}">Jetzt lesen</a></p>
        `,
      });
    }
  }
}
