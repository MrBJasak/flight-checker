import nodemailer from 'nodemailer';
import { getWelcomeMessage, getWelcomeTemplate } from './templates/welcomeTemplate';
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


      const subject = `✈️ Nowy samolot w Twojej okolicy: ${data.callsign || data.icao}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 24px; text-align: center; }
            .content { padding: 24px; }
            .aircraft-info { background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #6b7280; }
            .footer { background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✈️ Flight Checker</h1>
              <p>Nowy samolot w Twojej okolicy!</p>
            </div>
            
            <div class="content">
              <h2>Szczegóły lotu</h2>
              
              <div class="aircraft-info">
                <div class="info-row">
                  <span class="label">Znak wywoławczy:</span>
                  <span class="value">${data.callsign || 'Nieznany'}</span>
                </div>
                <div class="info-row">
                  <span class="label">ICAO:</span>
                  <span class="value">${data.icao}</span>
                </div>
                <div class="info-row">
                  <span class="label">Pozycja:</span>
                  <span class="value">${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}</span>
                </div>
                ${data.altitude ? `
                <div class="info-row">
                  <span class="label">Wysokość:</span>
                  <span class="value">${data.altitude} m</span>
                </div>
                ` : ''}
                <div class="info-row">
                  <span class="label">Odległość:</span>
                  <span class="value">${data.distance.toFixed(2)} km</span>
                </div>
                ${data.address ? `
                <div class="info-row">
                  <span class="label">Lokalizacja:</span>
                  <span class="value">${data.address}</span>
                </div>
                ` : ''}
              </div>

              <p>Samolot został wykryty w Twojej strefie monitorowania. Sprawdź szczegóły na <a href="https://flightradar24.com/data/aircraft/${data.icao.toLowerCase()}" target="_blank">Flightradar24</a>.</p>
            </div>
            
            <div class="footer">
              <p>Flight Checker - Powiadomienia o lotach</p>
              <p>Jeśli nie chcesz już otrzymywać powiadomień, skontaktuj się z nami.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
🛩️ FLIGHT CHECKER - Nowy samolot w okolicy!

Szczegóły lotu:
• Znak wywoławczy: ${data.callsign || 'Nieznany'}
• ICAO: ${data.icao}
• Pozycja: ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}
${data.altitude ? `• Wysokość: ${data.altitude} m` : ''}
• Odległość: ${data.distance.toFixed(2)} km
${data.address ? `• Lokalizacja: ${data.address}` : ''}

Więcej informacji: https://flightradar24.com/data/aircraft/${data.icao.toLowerCase()}
      `;

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

      const subject = `🎉 Witaj w Flight Checker! Subskrypcja została aktywowana`;

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
