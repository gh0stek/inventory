import { drizzle, PostgresJsTransaction } from "drizzle-orm/postgres-js";
import { Pool } from "pg";
import * as schema from "./schema";
import { DATABASE_URL } from "../env";
import { AsyncLocalStorage } from "node:async_hooks";
import { get } from "node:http";

export const DRIZZLE = Symbol("DRIZZLE");

async function drizzleInit() {
  const db = drizzle({
    schema,
    client: new Pool({ connectionString: DATABASE_URL }),
  });

  return db;
}
export const drizzleClient = drizzleInit();

export type DrizzleProvider = {
  db: Omit<Awaited<typeof drizzleClient>, "$client">;
};

const asyncLocalStorage = new AsyncLocalStorage<
  ReturnType<typeof createStorageObject>
>();

export const drizzleProvider = {
  provide: DRIZZLE,
  useFactory: async (): Promise<DrizzleProvider> => {
    const db = await drizzleClient;

    const dbGetter = () => {
      const store = asyncLocalStorage.getStore();
      if (store) {
        return store.db;
      }
      return db;
    };

    return {
      get db() {
        return dbGetter();
      },
    };
  },
};

const createStorageObject = (db: DrizzleProvider["db"]) => {
  return { db };
};

export function Transactional() {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const storageObject = asyncLocalStorage.getStore();
      if (storageObject) {
        return originalMethod.apply(this, args);
      }

      const db = await drizzleClient;

      return await db.transaction(async (txDb) => {
        return await asyncLocalStorage.run(
          createStorageObject(txDb),
          async () => {
            return await originalMethod.apply(this, args);
          },
        );
      });
    };

    return descriptor;
  };
}
