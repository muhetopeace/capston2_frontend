import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Please add it in your environment variables.");
}

// Validate connection string format
const dbUrl = process.env.DATABASE_URL;
const isPooledConnection = dbUrl?.includes("pooler.supabase.com");

if (isPooledConnection && !dbUrl?.includes("?pgbouncer=true")) {
  console.warn("⚠️  Warning: Pooled connection detected but missing '?pgbouncer=true' parameter");
  console.warn("   Consider adding '?pgbouncer=true' to your DATABASE_URL for better connection pooling");
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: { url: dbUrl },
    },
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;


