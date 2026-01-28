import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

export const DATABASE_URL = z
  .string()
  .optional()
  .default("postgres://inventory:inventory_secret@localhost:5432/inventory")
  .parse(process.env.DATABASE_URL, {
    error: () => ({ message: "Invalid DATABASE_URL" }),
  });
