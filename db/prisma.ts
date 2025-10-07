// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = global as unknown as { prisma: PrismaClient };

// export const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log: ['query'], // optional: logs queries for debugging
//   });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

import { PrismaClient } from "@prisma/client";

// This file is used to export a singleton instance of the PrismaClient.
// This prevents creating a new instance on every hot reload in development.

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // Logs SQL queries in the console for debugging
  });

// Only set the global instance in development environment
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// NOTE: In Next.js, this file will typically be imported by your Auth.js handler
// and other server-side data fetching functions (e.g., Server Components, API Routes).