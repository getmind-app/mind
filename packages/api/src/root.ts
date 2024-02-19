import { appointmentsRouter } from "./router/appointments";
import { authRouter } from "./router/auth";
import { hoursRouter } from "./router/hours";
import { notesRouter } from "./router/notes";
import { patientsRouter } from "./router/patients";
import { recurrenceRouter } from "./router/recurrences";
import { stripeRouter } from "./router/stripe";
import { therapistsRouter } from "./router/therapists";
import { usersRouter } from "./router/users";
import { waitlistRouter } from "./router/waitlist";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
    auth: authRouter,
    users: usersRouter,
    notes: notesRouter,
    therapists: therapistsRouter,
    appointments: appointmentsRouter,
    patients: patientsRouter,
    hours: hoursRouter,
    stripe: stripeRouter,
    waitlist: waitlistRouter,
    recurrences: recurrenceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
