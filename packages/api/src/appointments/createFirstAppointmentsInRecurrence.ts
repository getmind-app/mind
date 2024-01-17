import { type inferAsyncReturnType } from "@trpc/server";
import { addDays, differenceInWeeks, setHours } from "date-fns";

import { type createContext } from "../trpc";

export async function createFirstAppointmentsInRecurrence({
    prisma,
    recurrenceId,
}: inferAsyncReturnType<typeof createContext> & {
    recurrenceId: string;
}) {
    const recurrence = await prisma.recurrence.findUniqueOrThrow({
        where: {
            id: recurrenceId,
        },
    });

    const firstAppointmentScheduledTo = setHours(
        recurrence.startAt,
        recurrence.startTime.getHours(),
    );
    const nextMonth = addDays(new Date(), 31);
    const weeksToSchedule = differenceInWeeks(
        nextMonth,
        firstAppointmentScheduledTo,
    );

    for (let i = 1; i <= weeksToSchedule; i++) {
        const date = addDays(firstAppointmentScheduledTo, i * 7 + 1);

        await prisma.appointment.create({
            data: {
                recurrenceId,
                modality: recurrence.defaultModality,
                scheduledTo: date,
                patientId: recurrence.patientId,
                therapistId: recurrence.therapistId,
                status: "ACCEPTED",
                type: "RECURRENT",
            },
        });
    }
}
