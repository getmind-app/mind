import { type inferAsyncReturnType } from "@trpc/server";

import { cancelAppointmentInCalendar } from "../helpers/cancelAppointmentInCalendar";
import { type createContext } from "../trpc";

export async function cancelRecurrence({
    prisma,
    recurrenceId,
}: inferAsyncReturnType<typeof createContext> & {
    recurrenceId: string;
}) {
    // Cancel recurrence
    try {
        await prisma.recurrence.update({
            where: { id: recurrenceId },
            data: { status: "CANCELED" },
        });
    } catch (e) {
        console.error(`Failed to cancel recurrence, ${recurrenceId}`);
        console.error(e);
    }

    // Cancel appointments
    try {
        await prisma.appointment.updateMany({
            where: {
                recurrenceId,
                scheduledTo: {
                    gte: new Date(),
                },
                isPaid: false,
            },
            data: { status: "CANCELED" },
        });
    } catch (e) {
        console.error(
            `Failed to cancel appointments for recurrence, ${recurrenceId}`,
        );
        console.error(e);
    }

    // Cancel calendar events
    try {
        const cancelledAppointments = await prisma.appointment.findMany({
            where: {
                recurrenceId,
                scheduledTo: {
                    gte: new Date(),
                },
                status: "CANCELED",
            },
        });

        for (const appointment of cancelledAppointments) {
            if (!appointment.eventId) {
                continue;
            }
            cancelAppointmentInCalendar(appointment.eventId);
        }
    } catch (e) {
        console.error(
            `Failed to cancel calendar events for recurrence, ${recurrenceId}`,
        );
        console.error(e);
    }
}
