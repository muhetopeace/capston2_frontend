// @ts-ignore - Prisma client type resolution
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please check your .env file."
  );
}

// Validate and enhance connection string format for Supabase
const dbUrl = process.env.DATABASE_URL;
if (dbUrl.includes("db.") && dbUrl.includes(":6543")) {
  console.error(
    "\n⚠️  WARNING: You're using the direct connection hostname (db.*.supabase.co) with port 6543.\n" +
    "This won't work! Use the pooled connection hostname instead:\n" +
    "Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true\n" +
    "Get it from: Supabase Dashboard → Settings → Database → Connection Pooling\n"
  );
}

// Add pgbouncer parameter if using pooler but parameter is missing
if (dbUrl.includes("pooler.supabase.com") && !dbUrl.includes("pgbouncer=true") && !dbUrl.includes("?")) {
  console.warn(
    "\n⚠️  NOTE: Consider adding ?pgbouncer=true to your connection string for better connection pooling.\n"
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

