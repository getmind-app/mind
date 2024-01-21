import { addDays, differenceInWeeks, format } from "date-fns";

import { type Prisma, type PrismaClient, type WeekDay } from "@acme/db";

export async function checkForRecurrenceConflict({
    prisma,
    therapistId,
    scheduledTo,
}: {
    prisma: PrismaClient;
    therapistId: string;
    scheduledTo: Date;
}) {
    const todayPlus31 = addDays(new Date(), 31);
    const weeksToCheck = differenceInWeeks(todayPlus31, scheduledTo);

    const possibleAppointments: Prisma.AppointmentWhereInput[] = [];

    for (let i = 0; i <= weeksToCheck; i++) {
        possibleAppointments.push({
            therapistId: therapistId,
            scheduledTo: addDays(scheduledTo, i * 7),
            status: "ACCEPTED",
        });
    }

    const appointments = await prisma.appointment.count({
        where: {
            OR: possibleAppointments,
        },
    });

    if (appointments > 0) {
        return true;
    }

    const weekDay = format(scheduledTo, "EEEE").toUpperCase() as WeekDay;

    const recurrences = await prisma.recurrence.count({
        where: {
            therapistId: therapistId,
            startTime: scheduledTo,
            status: "ACCEPTED",
            weekDay,
        },
    });

    if (recurrences > 0) {
        return true;
    }

    return false;
}
