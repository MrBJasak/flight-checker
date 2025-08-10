import { eq } from 'drizzle-orm';
import { emailService } from '../../../shared/email/email';
import { db } from '../../../shared/lib/db';
import { subscriptions } from '../../../shared/lib/db/schema';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, latitude, longitude, radius, aircraftFilters } = body;

    if (!email || !latitude || !longitude || !radius) {
      return new Response(
        JSON.stringify({
          message: 'Wszystkie pola są wymagane (email, latitude, longitude, radius)',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const existing = await db.select().from(subscriptions).where(eq(subscriptions.email, email));

    if (existing.length > 0) {
      return new Response(JSON.stringify({ message: 'Email already subscribed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Wstaw subskrypcję w transakcji
    await db.transaction(async (tx) => {
      // Wstaw subskrypcję
      const [subscription] = await tx
        .insert(subscriptions)
        .values({
          email,
          latitude,
          longitude,
          radius,
        })
        .returning({ id: subscriptions.id });

      // // Jeśli są filtry samolotów, wstaw je
      // if (aircraftFilters && Array.isArray(aircraftFilters) && aircraftFilters.length > 0) {
      //   const filterInserts = aircraftFilters
      //     .filter((filter: AircraftFilter) =>
      //       filter.manufacturerName || filter.model || filter.typeCode || filter.operator
      //     )
      //     .map((filter: AircraftFilter) => ({
      //       subscriptionId: subscription.id,
      //       manufacturername: filter.manufacturerName || null,
      //       model: filter.model || null,
      //       typecode: filter.typeCode || null,
      //       operator: filter.operator || null,
      //     }));

      //   if (filterInserts.length > 0) {
      //     await tx.insert(subscriptionAircraft).values(filterInserts);
      //   }
      // }
    });

    try {
      await emailService.sendWelcomeEmail({
        email,
        latitude,
        longitude,
        radius,
        aircraftFilters,
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    return new Response(JSON.stringify({ message: 'Subscribed successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in subscribe API:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
