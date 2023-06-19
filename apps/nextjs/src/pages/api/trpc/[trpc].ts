import { createNextApiHandler } from "@trpc/server/adapters/next";
import { z } from "zod";

import { appRouter, createTRPCContext } from "@acme/api";

export const runtime = "edge";

const essentialEnv = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
});

const env = essentialEnv.safeParse(process.env);

if (!env.success) {
  throw new Error(env.error.message);
}

export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
});
