import { authRouter } from "./router/auth";
import { notesRouter } from "./router/notes";
import { therapistsRouter } from "./router/therapists";
import { usersRouter } from "./router/users";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  users: usersRouter,
  notes: notesRouter,
  therapists: therapistsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
