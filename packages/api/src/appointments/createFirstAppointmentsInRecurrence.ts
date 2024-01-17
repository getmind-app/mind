import { type inferAsyncReturnType } from "@trpc/server";
import { addDays, addWeeks, differenceInWeeks } from "date-fns";

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

    const firstDate = recurrence.startAt;
    const nextMonth = addDays(new Date(), 31);
    const weeksToSchedule = differenceInWeeks(nextMonth, firstDate);

    for (let i = 0; i < weeksToSchedule; i++) {
        const date = addWeeks(firstDate, 1);

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
