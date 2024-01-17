import { type inferAsyncReturnType } from "@trpc/server";

import { type createContext } from "../trpc";

export async function createFirstAppointmentsInRecurrence({
    auth,
    prisma,
    recurrenceId,
}: inferAsyncReturnType<typeof createContext> & {
    recurrenceId: string;
}) {
    const firstAppointment = await prisma.appointment.findFirstOrThrow({
        where: {
            recurrenceId,
        },
    });

    firstAppointment.scheduledTo;
}
