import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "src/env";

export default defineConfig({
  schema: "./src/database/schema.ts",
  out: "./src/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
