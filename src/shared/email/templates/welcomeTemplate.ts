export interface WelcomeTemplateData {
  email: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export const getWelcomeTemplate = ({ email, latitude, longitude, radius }: WelcomeTemplateData): string =>
  `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 24px; text-align: center; }
    .content { padding: 24px; }
    .subscription-info { background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #10b981; }
    .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
    .label { font-weight: bold; color: #374151; }
    .value { color: #6b7280; }
    .footer { background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; }
    .highlight { background: #fef3c7; padding: 12px; border-radius: 6px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✈️ Flight Checker</h1>
      <p>Witaj w systemie powiadomień o lotach!</p>
    </div>
    
    <div class="content">
      <h2>🎉 Gratulacje!</h2>
      
      <p>Twoja subskrypcja została pomyślnie aktywowana. Od teraz będziesz otrzymywać powiadomienia o samolotach lecących w pobliżu wybranej lokalizacji.</p>
      
      <div class="subscription-info">
        <h3>Szczegóły Twojej subskrypcji:</h3>
        <div class="info-row">
          <span class="label">Email:</span>
          <span class="value">${email}</span>
        </div>
        <div class="info-row">
          <span class="label">Monitorowana pozycja:</span>
          <span class="value">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</span>
        </div>
        <div class="info-row">
          <span class="label">Promień monitorowania:</span>
          <span class="value">${radius} km</span>
        </div>
      </div>

      <div class="highlight">
        <strong>Co dalej?</strong><br>
        System będzie automatycznie monitorować wybrane obszary i wysyłać powiadomienia, gdy wykryje samoloty w Twojej strefie. Pierwsze powiadomienie może pojawić się już wkrótce!
      </div>

      <p>Dziękujemy za skorzystanie z Flight Checker. Życzymy miłego śledzenia lotów! ✈️</p>
    </div>
    
    <div class="footer">
      <p>Flight Checker - System powiadomień o lotach</p>
      <p>Jeśli masz pytania lub chcesz anulować subskrypcję, skontaktuj się z nami.</p>
    </div>
  </div>
</body>
</html>`;

export const getWelcomeMessage = ({
  email,
  latitude,
  longitude,
  radius,
}: WelcomeTemplateData): string => `🎉 FLIGHT CHECKER - Witaj w systemie powiadomień!

Gratulacje! Twoja subskrypcja została pomyślnie aktywowana.

Szczegóły subskrypcji:
• Email: ${email}
• Monitorowana pozycja: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
• Promień monitorowania: ${radius} km

Od teraz będziesz otrzymywać powiadomienia o samolotach lecących w pobliżu wybranej lokalizacji.

Dziękujemy za skorzystanie z Flight Checker! ✈️`;

export const getWelcomeTitle = () => `🎉 Witaj w Flight Checker! Subskrypcja została aktywowana`;
