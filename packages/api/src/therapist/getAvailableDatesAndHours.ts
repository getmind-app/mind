import { addDays, addHours, format, isSameDay, isWeekend } from "date-fns";

import { type Appointment, type Hour, type Therapist } from "@acme/db";

export function getAvailableDatesAndHours({
    therapist,
    numberOfDays = 30,
    // account for the time zone difference
    // couldn't get date-fns-tz to work
    startingDate = addHours(new Date(), -3),
}: {
    therapist: Therapist & {
        hours: Hour[];
        appointments: Appointment[];
    };
    numberOfDays?: number;
    startingDate?: Date;
}) {
    const allHoursInNext30Days: {
        date: Date;
        hour: Hour;
    }[] = [];

    for (let i = 0; i < numberOfDays; i++) {
        const date = addDays(startingDate, i);

        if (isWeekend(date)) {
            continue;
        }

        const availableHours = therapist.hours.filter(
            (hour) => hour.weekDay === format(date, "EEEE").toUpperCase(),
        );

        for (let j = 0; j < availableHours.length; j++) {
            allHoursInNext30Days.push({
                date,
                hour: availableHours[j] as Hour,
            });
        }
    }

    for (let i = 0; i < allHoursInNext30Days.length; i++) {
        const date = allHoursInNext30Days[i]?.date as Date;
        const appointmentsOnTheSameDay = therapist.appointments.filter(
            (appointment) => isSameDay(appointment.scheduledTo, date),
        );

        const foundConflict = appointmentsOnTheSameDay.some((appointment) => {
            appointment.hourId === allHoursInNext30Days[i]?.hour.id;
        });

        if (foundConflict) {
            allHoursInNext30Days.splice(i, 1);
        }
    }

    const allHoursInNext30DaysOrganized = allHoursInNext30Days.reduce(
        (acc, current) => {
            const monthIndex = current.date.getMonth();

            if (!acc[monthIndex]) {
                acc[monthIndex] = [
                    {
                        date: current.date,
                        hours: [current.hour],
                    },
                ];
            } else {
                const hasCurrentDate = acc[monthIndex]?.find((date) =>
                    isSameDay(date.date, current.date),
                );

                if (hasCurrentDate) {
                    hasCurrentDate.hours.push(current.hour);
                } else {
                    acc[monthIndex]?.push({
                        date: current.date,
                        hours: [current.hour],
                    });
                }
            }

            return acc;
        },
        {} as Record<number, { date: Date; hours: Hour[] }[]>,
    );
    return allHoursInNext30DaysOrganized;
}
