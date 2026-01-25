import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');

export const drizzleProvider = {
  provide: DRIZZLE,
  useFactory: async () => {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgres://inventory:inventory_secret@localhost:5432/inventory';

    const client = postgres(connectionString);
    const db = drizzle(client, { schema });

    return db;
  },
};

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;
