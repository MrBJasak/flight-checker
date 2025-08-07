export async function initializeServices() {
  console.log('🚀 Inicjalizacja serwisów Flight Checker...');

  try {
    console.log('✅ Wszystkie serwisy zostały zainicjalizowane');
  } catch (error) {
    console.error('❌ Błąd inicjalizacji serwisów:', error);
  }
}

// Obsługa graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Otrzymano sygnał SIGINT, zatrzymuję serwisy...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Otrzymano sygnał SIGTERM, zatrzymuję serwisy...');
  process.exit(0);
});
