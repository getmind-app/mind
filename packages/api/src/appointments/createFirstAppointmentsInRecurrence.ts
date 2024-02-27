import { type inferAsyncReturnType } from "@trpc/server";
import { addDays, differenceInWeeks, setHours } from "date-fns";

import { createAppointmentInCalendar } from "../helpers/createAppointmentInCalendar";
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
        include: {
            therapist: true,
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

    const promises = [];

    for (let i = 1; i <= weeksToSchedule; i++) {
        const date = addDays(firstAppointmentScheduledTo, i * 7 + 1);

        // Create the appointment without waiting for it to finish
        const appointmentPromise = prisma.appointment.create({
            data: {
                rate: recurrence.therapist.hourlyRate,
                recurrenceId,
                modality: recurrence.defaultModality,
                scheduledTo: date,
                patientId: recurrence.patientId,
                therapistId: recurrence.therapistId,
                status: "ACCEPTED",
                type: "RECURRENT",
                hourId: recurrence.hourId,
            },
        });

        // Store the promise for later
        promises.push(appointmentPromise);
    }

    try {
        const appointments = await Promise.all(promises);
        try {
            await Promise.all(
                appointments.map((appointment) =>
                    createAppointmentInCalendar({ appointment, prisma }),
                ),
            );
        } catch {
            console.error(
                `An error occurred while creating appointments in calendar, recurrence id: ${recurrenceId}`,
            );
        }
    } catch (error) {
        console.error(
            "An error occurred while scheduling appointments:",
            error,
        );
    }
}
