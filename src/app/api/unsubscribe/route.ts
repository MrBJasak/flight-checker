import { eq } from 'drizzle-orm';
import { db } from '../../../shared/lib/db';
import { subscriptions } from '../../../shared/lib/db/schema';

export async function POST(req: Request) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          message: 'Nieprawidłowy format danych. Wymagany jest poprawny JSON.',
          error: 'INVALID_JSON',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const { email } = body;

    // Enhanced validation
    if (!email) {
      return new Response(
        JSON.stringify({
          message: 'Email jest wymagany',
          error: 'VALIDATION_ERROR',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({
          message: 'Email ma nieprawidłowy format',
          error: 'VALIDATION_ERROR',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Check if email exists in subscriptions
    const existing = await db.select().from(subscriptions).where(eq(subscriptions.email, email));

    if (existing.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'Ten email nie jest zarejestrowany w systemie',
          error: 'EMAIL_NOT_FOUND',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Delete the subscription
    await db.delete(subscriptions).where(eq(subscriptions.email, email));

    return new Response(
      JSON.stringify({
        message: 'Subskrypcja została pomyślnie anulowana',
        success: true,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error in unsubscribe API:', error);
    return new Response(
      JSON.stringify({
        message: 'Wystąpił błąd serwera. Spróbuj ponownie później.',
        error: 'INTERNAL_SERVER_ERROR',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
