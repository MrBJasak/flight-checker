import nodemailer from 'nodemailer';
import { getCurrentPlaneSubject, getCurrentPlaneTemplate } from './templates/currentPlane';
import { getWelcomeMessage, getWelcomeTemplate, getWelcomeTitle } from './templates/welcomeTemplate';
import { FlightNotificationData, WelcomeEmailData } from './types';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private async createTransporter() {
    if (this.transporter) return this.transporter;

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    return this.transporter;
  }

  async sendFlightNotification(data: FlightNotificationData): Promise<boolean> {
    try {
      const transporter = await this.createTransporter();
      if (!transporter) {
        throw new Error('Failed to create email transporter');
      }

      const subject = getCurrentPlaneSubject(data.callsign || 'nieznany', data.icao || 'N/A');

      const htmlContent = getCurrentPlaneTemplate(data);

      const textContent = `Samolot ${data.callsign || 'nieznany'} (${data.icao}) został wykryty w Twojej okolicy!`;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: data.email,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`📧 Email wysłany do ${data.email} o samolocie ${data.callsign || data.icao}`);
      return true;
    } catch (error) {
      console.error('❌ Błąd wysyłania emaila:', error);
      return false;
    }
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      const transporter = await this.createTransporter();
      if (!transporter) {
        throw new Error('Failed to create email transporter');
      }

      const subject = getWelcomeTitle();

      const htmlContent = getWelcomeTemplate(data);

      const textContent = getWelcomeMessage(data);

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: data.email,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`📧 Email powitalny wysłany do ${data.email}`);
      return true;
    } catch (error) {
      console.error('❌ Błąd wysyłania emaila powitalnego:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
