import { authRouter } from "./router/auth";
import { notesRouter } from "./router/notes";
import { usersRouter } from "./router/users";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  users: usersRouter,
  notes: notesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
