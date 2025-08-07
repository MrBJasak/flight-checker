import { pgTable, real, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  radius: real('radius').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
