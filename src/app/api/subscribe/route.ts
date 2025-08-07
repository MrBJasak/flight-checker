
// import { eq } from 'drizzle-orm';
// import { db } from '../../shared/lib/db';
// import { subscriptions } from '../../shared/lib/db/schema';

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { email, latitude, longitude, radius } = body;

//     // Walidacja danych
//     if (!email || !latitude || !longitude || !radius) {
//       return new Response(
//         JSON.stringify({ 
//           message: 'Wszystkie pola są wymagane (email, latitude, longitude, radius)' 
//         }),
//         { status: 400, headers: { 'Content-Type': 'application/json' } }
//       );
//     }

//     // Sprawdź czy email jest już zarejestrowany
//     const existing = await db
//       .select()
//       .from(subscriptions)
//       .where(eq(subscriptions.email, email));

//     if (existing.length > 0) {
//       return new Response(
//         JSON.stringify({ message: 'Email already subscribed' }),
//         { status: 400, headers: { 'Content-Type': 'application/json' } }
//       );
//     }

//     // Dodaj nową subskrypcję
//     await db.insert(subscriptions).values({
//       email,
//       latitude,
//       longitude,
//       radius,
//     });

//     // // Wyślij email powitalny
//     // try {

//     //     console.log('Sending welcome email to:', email);
//     //   await emailService.sendWelcomeEmail({
//     //     email,
//     //     latitude,
//     //     longitude,
//     //     radius,
//     //   });
//     // } catch (emailError) {
//     //   console.error('Error sending welcome email:', emailError);
//     //   // Nie przerywamy procesu jeśli email się nie wysłał
//     // }

//     return new Response(
//       JSON.stringify({ message: 'Subscribed successfully' }), 
//       { status: 200, headers: { 'Content-Type': 'application/json' } }
//     );
//   } catch (error) {
//     console.error('Error in subscribe API:', error);
//     return new Response(
//       JSON.stringify({ message: 'Internal server error' }),
//       { status: 500, headers: { 'Content-Type': 'application/json' } }
//     );
//   }
// }