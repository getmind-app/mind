import { appointmentsRouter } from "./router/appointments";
import { authRouter } from "./router/auth";
import { notesRouter } from "./router/notes";
import { patientsRouter } from "./router/patients";
import { stripeRouter } from "./router/stripe";
import { therapistsRouter } from "./router/therapists";
import { usersRouter } from "./router/users";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
    auth: authRouter,
    users: usersRouter,
    notes: notesRouter,
    therapists: therapistsRouter,
    appointments: appointmentsRouter,
    patients: patientsRouter,
    stripe: stripeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
