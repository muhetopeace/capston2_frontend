// Type declaration for @prisma/client
declare module "@prisma/client" {
  import { PrismaClient as Client } from "@prisma/client/.prisma/client/default";
  export const PrismaClient: typeof Client;
  export type PrismaClient = Client;
  export * from "@prisma/client/.prisma/client/default";
}

