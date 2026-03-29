import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@solawi-manager.local';
const FRONTEND_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

export async function sendMagicLinkEmail(email: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: EMAIL_FROM,
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

export async function sendApplicationConfirmation(email: string, name: string): Promise<void> {
  await transporter.sendMail({
    from: EMAIL_FROM,
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

export async function sendBlogPublishedNotification(
  emails: string[],
  title: string,
  slug: string
): Promise<void> {
  for (const email of emails) {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: `Neuer Blog-Beitrag: ${title}`,
      html: `
        <h2>Neuer Blog-Beitrag</h2>
        <p>Es gibt einen neuen Beitrag in unserem Blog:</p>
        <h3>${title}</h3>
        <p><a href="${FRONTEND_URL}/blog/${slug}">Jetzt lesen</a></p>
      `,
    });
  }
}
