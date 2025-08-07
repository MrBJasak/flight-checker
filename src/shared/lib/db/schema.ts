import { pgTable, real, text, timestamp, uuid, varchar, boolean } from 'drizzle-orm/pg-core';

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  radius: real('radius').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const aircraft = pgTable('aircraft', {
  id: uuid('id').primaryKey().defaultRandom(),
  icao24: varchar('icao24', { length: 15 }),
  registration: varchar('registration', { length: 30 }),
  manufacturericao: varchar('manufacturericao', { length: 50 }),
  manufacturername: varchar('manufacturername', { length: 150 }),
  model: varchar('model', { length: 150 }),
  typecode: varchar('typecode', { length: 30 }),
  serialnumber: varchar('serialnumber', { length: 100 }),
  linenumber: varchar('linenumber', { length: 50 }),
  icaoaircrafttype: varchar('icaoaircrafttype', { length: 15 }),
  operator: varchar('operator', { length: 300 }),
  operatorcallsign: varchar('operatorcallsign', { length: 50 }),
  operatoricao: varchar('operatoricao', { length: 15 }),
  operatoriata: varchar('operatoriata', { length: 15 }),
  owner: varchar('owner', { length: 300 }),
  testreg: varchar('testreg', { length: 30 }),
  registered: varchar('registered', { length: 100 }),
  reguntil: varchar('reguntil', { length: 100 }),
  status: varchar('status', { length: 150 }),
  built: varchar('built', { length: 100 }),
  firstflightdate: varchar('firstflightdate', { length: 100 }),
  seatconfiguration: text('seatconfiguration'),
  engines: text('engines'),
  modes: boolean('modes').default(false),
  adsb: boolean('adsb').default(false),
  acars: boolean('acars').default(false),
  notes: text('notes'),
  categoryDescription: text('categoryDescription'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Tabela łącząca subskrypcje z wybranymi samolotami
export const subscriptionAircraft = pgTable('subscription_aircraft', {
  id: uuid('id').primaryKey().defaultRandom(),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id, { onDelete: 'cascade' }),
  manufacturername: varchar('manufacturername', { length: 150 }),
  model: varchar('model', { length: 150 }),
  typecode: varchar('typecode', { length: 30 }),
  operator: varchar('operator', { length: 300 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
