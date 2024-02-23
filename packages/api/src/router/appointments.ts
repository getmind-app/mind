import type * as Notification from "expo-notifications";
import clerk from "@clerk/clerk-sdk-node";
import {
    addDays,
    addHours,
    endOfDay,
    format,
    getHours,
    set,
    startOfDay,
} from "date-fns";
import { z } from "zod";

import { type Appointment, type Hour, type WeekDay } from "@acme/db";

import { cancelRecurrence } from "../appointments/cancelRecurrence";
import { createFirstAppointmentsInRecurrence } from "../appointments/createFirstAppointmentsInRecurrence";
import { cancelAppointmentInCalendar } from "../helpers/cancelAppointmentInCalendar";
import { createAppointmentInCalendar } from "../helpers/createAppointmentInCalendar";
import { sendPushNotification } from "../helpers/sendPushNotification";
import { notifyAppointmentStatusChange } from "../notifications/notifyAppointmentStatusChange";
import { payForAppointment } from "../payments/payForAppointment";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const appointmentsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                scheduledTo: z.date(),
                modality: z.enum(["ONLINE", "ON_SITE"]),
                therapistId: z.string().min(1),
                patientId: z.string().min(1),
                hourId: z.string().min(1),
                repeat: z.boolean(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const [therapist, patient] = await Promise.all([
                ctx.prisma.therapist.findUnique({
                    where: {
                        id: input.therapistId,
                    },
                }),

                ctx.prisma.patient.findUnique({
                    where: {
                        id: input.patientId,
                    },
                }),
            ]);

            if (!therapist?.userId) {
                console.error("Couldn't find therapist");
                throw new Error("Couldn't find therapist");
            }

            if (!patient?.userId) {
                console.error("Couldn't find patient");
                throw new Error("Couldn't find patient");
            }

            const therapistUser = await clerk.users.getUser(therapist.userId);
            let recurrenceId = null;

            if (input.repeat) {
                const recurrence = await ctx.prisma.recurrence.create({
                    data: {
                        defaultModality: input.modality,
                        therapistId: input.therapistId,
                        patientId: input.patientId,
                        hourId: input.hourId,
                        startTime: input.scheduledTo,
                        startAt: input.scheduledTo,
                        endTime: addHours(input.scheduledTo, 1),
                        weekDay: format(
                            input.scheduledTo,
                            "EEEE",
                        ).toUpperCase() as WeekDay,
                    },
                });
                recurrenceId = recurrence.id;

                await sendPushNotification({
                    expoPushToken: therapistUser.publicMetadata
                        .expoPushToken as Notification.ExpoPushToken,
                    title: "Nova recorrência! 🔵",
                    body: `${patient?.name} quer marcar sessões semanais com você.`,
                });
            } else {
                await sendPushNotification({
                    expoPushToken: therapistUser.publicMetadata
                        .expoPushToken as Notification.ExpoPushToken,
                    title: "Nova sessão! 🎉",
                    body: `${patient?.name} quer marcar um horário com você.`,
                });
            }

            return await ctx.prisma.appointment.create({
                data: {
                    modality: input.modality,
                    hourId: input.hourId,
                    scheduledTo: input.scheduledTo,
                    therapistId: input.therapistId,
                    patientId: input.patientId,
                    type: input.repeat ? "FIRST_IN_RECURRENCE" : "SINGLE",
                    recurrenceId,
                },
            });
        }),
    findNextUserAppointment: protectedProcedure.query(async ({ ctx }) => {
        let foundAppointment;

        const user = await clerk.users.getUser(ctx.auth.userId);

        if (user.publicMetadata.role === "professional") {
            const therapist = await ctx.prisma.therapist.findFirst({
                where: { userId: ctx.auth.userId },
            });

            foundAppointment = await ctx.prisma.appointment.findFirst({
                where: {
                    therapistId: therapist?.id,
                    scheduledTo: {
                        gte: new Date(),
                    },
                    status: {
                        notIn: ["CANCELED", "REJECTED", "PENDENT"],
                    },
                },
                include: {
                    therapist: {
                        include: {
                            address: true,
                        },
                    },
                    patient: true,
                },
                orderBy: {
                    scheduledTo: "asc",
                },
            });
        } else {
            const patient = await ctx.prisma.patient.findFirst({
                where: { userId: ctx.auth.userId },
            });

            foundAppointment = await ctx.prisma.appointment.findFirst({
                where: {
                    patientId: patient?.id,
                    scheduledTo: {
                        gte: new Date(),
                    },
                    status: {
                        notIn: ["CANCELED", "REJECTED", "PENDENT"],
                    },
                },
                include: {
                    therapist: {
                        include: {
                            address: true,
                        },
                    },
                    patient: true,
                },
                orderBy: {
                    scheduledTo: "asc",
                },
            });
        }

        return foundAppointment;
    }),
    findById: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
            }),
        )
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.appointment.findUniqueOrThrow({
                where: {
                    id: input.id,
                },
                include: {
                    therapist: true,
                    patient: true,
                },
            });
        }),
    findAll: protectedProcedure.query(async ({ ctx }) => {
        let foundAppointments;

        const user = await clerk.users.getUser(ctx.auth.userId);

        if (user.publicMetadata.role === "professional") {
            const therapist = await ctx.prisma.therapist.findFirst({
                where: { userId: ctx.auth.userId },
            });

            foundAppointments = await ctx.prisma.appointment.findMany({
                where: {
                    therapistId: therapist?.id,
                },
                include: {
                    therapist: {
                        include: {
                            address: true,
                        },
                    },
                    patient: true,
                },
                orderBy: {
                    scheduledTo: "asc",
                },
            });
        } else {
            const patient = await ctx.prisma.patient.findFirst({
                where: { userId: ctx.auth.userId },
            });
            foundAppointments = await ctx.prisma.appointment.findMany({
                where: {
                    patientId: patient?.id,
                },
                include: {
                    therapist: {
                        include: {
                            address: true,
                        },
                    },
                    patient: true,
                },
                orderBy: {
                    scheduledTo: "asc",
                },
            });
        }
        return foundAppointments;
    }),
    updateRecurrence: protectedProcedure
        .input(
            z.object({
                recurrenceId: z.string().min(1),
                status: z.enum(["PENDENT", "ACCEPTED", "REJECTED", "CANCELED"]),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const recurrence = await ctx.prisma.recurrence.update({
                where: {
                    id: input.recurrenceId,
                },
                data: {
                    status: input.status,
                },
            });

            if (input.status === "ACCEPTED") {
                await createFirstAppointmentsInRecurrence({
                    ...ctx,
                    recurrenceId: input.recurrenceId,
                });
            }

            if (input.status === "CANCELED") {
                await cancelRecurrence({
                    ...ctx,
                    recurrenceId: input.recurrenceId,
                });
            }

            return recurrence;
        }),
    update: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
                scheduledTo: z.date(),
                modality: z.enum(["ONLINE", "ON_SITE"]),
                status: z.enum(["PENDENT", "ACCEPTED", "REJECTED", "CANCELED"]),
                isPaid: z.boolean(),
                therapistId: z.string().min(1),
                patientId: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            if (input.status === "PENDENT") {
                throw new Error("Cannot update appointment status to PENDENT");
            }

            const appointment = await ctx.prisma.appointment.findUniqueOrThrow({
                where: {
                    id: input.id,
                },
            });

            let calendarEvent: null | Awaited<
                ReturnType<typeof createAppointmentInCalendar>
            > = null;

            if (input.status === "ACCEPTED") {
                calendarEvent = await createAppointmentInCalendar({
                    appointment,
                    prisma: ctx.prisma,
                });
            }

            if (input.status === "CANCELED") {
                await cancelAppointmentInCalendar(appointment.eventId ?? "");
            }

            await notifyAppointmentStatusChange({
                newStatus: input.status,
                appointment,
                prisma: ctx.prisma,
            });

            return await ctx.prisma.appointment.update({
                where: {
                    id: input.id,
                },
                data: {
                    ...input,
                    ...(calendarEvent
                        ? {
                              link: calendarEvent.data.hangoutLink,
                              eventId: calendarEvent.data.id,
                          }
                        : {}),
                },
            });
        }),
    checkAppointmentAsPaid: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.appointment.update({
                where: {
                    id: input.id,
                },
                data: {
                    isPaid: true,
                    paidAt: new Date(),
                },
            });
        }),
    checkAppointmentAsNotPaid: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.appointment.update({
                where: {
                    id: input.id,
                },
                data: {
                    isPaid: false,
                    paidAt: null,
                },
            });
        }),
    requestReschedule: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.appointment.update({
                where: {
                    id: input.id,
                },
                data: {
                    rescheduleRequested: true,
                },
            });
        }),
    similarHoursBasedOnAppointment: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
            }),
        )
        .query(async ({ ctx, input }) => {
            const appointment = await ctx.prisma.appointment.findUnique({
                where: {
                    id: input.id,
                },
            });

            if (!appointment) {
                throw new Error("Appointment not found");
            }

            const therapistHours = await ctx.prisma.hour.findMany({
                where: {
                    therapistId: appointment.therapistId,
                    OR: [
                        // Same day, different hours
                        {
                            weekDay: format(
                                appointment.scheduledTo,
                                "EEEE",
                            ).toUpperCase() as WeekDay,
                        },
                        // Different days, same hour
                        {
                            startAt: {
                                lte: getHours(appointment.scheduledTo) + 1,
                                gte: getHours(appointment.scheduledTo) - 1,
                            },
                            NOT: {
                                weekDay: format(
                                    appointment.scheduledTo,
                                    "EEEE",
                                ).toUpperCase() as WeekDay,
                            },
                        },
                    ],
                },
            });

            const similarAppointmentsOnDifferentDays =
                await ctx.prisma.appointment.findMany({
                    where: {
                        therapistId: appointment.therapistId,
                        scheduledTo: {
                            gte: addDays(appointment.scheduledTo, -2),
                            lte: addDays(appointment.scheduledTo, 2),
                        },
                        NOT: {
                            scheduledTo: {
                                gte: startOfDay(appointment.scheduledTo),
                                lte: endOfDay(appointment.scheduledTo),
                            },
                        },
                    },
                });

            const appointmentsOnTheSameDay =
                await ctx.prisma.appointment.findMany({
                    where: {
                        therapistId: appointment.therapistId,
                        scheduledTo: {
                            gte: startOfDay(appointment.scheduledTo),
                            lte: endOfDay(appointment.scheduledTo),
                        },
                    },
                });

            const availableHoursOnDifferentDays = therapistHours
                .filter(
                    (hour) =>
                        !(
                            hour.weekDay ===
                            (format(
                                appointment.scheduledTo,
                                "EEEE",
                            ).toUpperCase() as WeekDay)
                        ),
                )
                .filter((hour) => {
                    const isHourAvailable =
                        !similarAppointmentsOnDifferentDays.some(
                            (appointment) =>
                                getHours(appointment.scheduledTo) ===
                                hour.startAt,
                        );
                    return isHourAvailable;
                })
                .reduce((acc, hour) => {
                    if (acc[hour.weekDay]) {
                        (acc[hour.weekDay] as Hour[]).push(hour);
                    } else {
                        acc[hour.weekDay] = [hour];
                    }
                    return acc;
                }, {} as { [key: string]: Hour[] });

            const availableHoursOnTheSameDay = therapistHours
                .filter((hour) => {
                    return (
                        hour.weekDay ===
                        (format(
                            appointment.scheduledTo,
                            "EEEE",
                        ).toUpperCase() as WeekDay)
                    );
                })
                .filter((hour) => {
                    const isHourAvailable = !appointmentsOnTheSameDay.some(
                        (appointment) =>
                            getHours(appointment.scheduledTo) === hour.startAt,
                    );
                    return isHourAvailable;
                });

            return {
                availableHoursOnTheSameDay,
                availableHoursOnDifferentDays,
            };
        }),
    prepareTomorrowAppointments: publicProcedure.mutation(async ({ ctx }) => {
        console.log("prepareTomorrowAppointments is currently disabled");
        return null;
        console.log("Preparing tomorrow appointments");
        const now = new Date();
        const appointmentsToBePaid = await ctx.prisma.appointment.findMany({
            where: {
                scheduledTo: {
                    gte: now,
                    lt: addHours(now, 24),
                },
                status: "ACCEPTED",
                isPaid: false,
            },
        });

        const paidAppointments: Appointment[] = [];
        for (const appointment of appointmentsToBePaid) {
            try {
                await payForAppointment({
                    appointment,
                    prisma: ctx.prisma,
                });
                paidAppointments.push(appointment);
            } catch (e) {
                console.log("Error paying for appointment", appointment.id);
                console.log(JSON.stringify(e, null, 2));
                try {
                    await ctx.prisma.appointment.update({
                        where: {
                            id: appointment.id,
                        },
                        data: {
                            status: "CANCELED",
                        },
                    });
                } catch {
                    console.log("Error canceling appointment", appointment.id);
                }
            }
        }
        console.log(`Paid ${paidAppointments.length} appointments`);
    }),
    prepareNextMonthAppointments: publicProcedure.mutation(async ({ ctx }) => {
        console.log("Preparing next month appointments");
        const thirtyDaysFromNow = addDays(new Date(), 31);
        const weekDay = format(
            thirtyDaysFromNow,
            "EEEE",
        ).toUpperCase() as WeekDay;

        const recurrentAppointmentsToSchedule =
            await ctx.prisma.recurrence.findMany({
                where: {
                    status: "ACCEPTED",
                    weekDay,
                },
            });

        const createdAppointments: Appointment[] = [];
        for (const recurrence of recurrentAppointmentsToSchedule) {
            const startAtTime = new Date(recurrence.startTime);
            const date = set(startAtTime, {
                year: thirtyDaysFromNow.getFullYear(),
                month: thirtyDaysFromNow.getMonth(),
                date: thirtyDaysFromNow.getDate(),
            });

            try {
                const appointment = await ctx.prisma.appointment.create({
                    data: {
                        scheduledTo: date,
                        hourId: recurrence.hourId,
                        modality: recurrence.defaultModality,
                        therapistId: recurrence.therapistId,
                        patientId: recurrence.patientId,
                        type: "RECURRENT",
                        status: "ACCEPTED",
                        recurrenceId: recurrence.id,
                    },
                });
                createdAppointments.push(appointment);
            } catch (e) {
                console.log("Error creating appointment", recurrence.id);
                console.log(JSON.stringify(e, null, 2));
            }
        }

        console.log(
            `Created ${createdAppointments.length}, creating appointments in calendar`,
        );
        for (const appointment of createdAppointments) {
            try {
                await createAppointmentInCalendar({
                    appointment,
                    prisma: ctx.prisma,
                });
            } catch (e) {
                console.log(
                    "Error creating appointment in calendar",
                    appointment.id,
                );
                console.log(JSON.stringify(e, null, 2));
            }
        }
    }),
});
