import type * as Notification from "expo-notifications";
import clerk from "@clerk/clerk-sdk-node";
import {
    addDays,
    addHours,
    format,
    getHours,
    isSameDay,
    set,
    setHours,
} from "date-fns";
import { z } from "zod";

import { type Appointment, type WeekDay } from "@acme/db";

import { cancelRecurrence } from "../appointments/cancelRecurrence";
import { createFirstAppointmentsInRecurrence } from "../appointments/createFirstAppointmentsInRecurrence";
import { cancelAppointmentInCalendar } from "../helpers/cancelAppointmentInCalendar";
import { createAppointmentInCalendar } from "../helpers/createAppointmentInCalendar";
import { sendPushNotification } from "../helpers/sendPushNotification";
import { updateAppointmentInCalendar } from "../helpers/updateAppointmentInCalendar";
import { notifyAppointmentStatusChange } from "../notifications/notifyAppointmentStatusChange";
import { payForAppointment } from "../payments/payForAppointment";
import { getAvailableDatesAndHours } from "../therapist/getAvailableDatesAndHours";
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
                    rate: therapist.hourlyRate,
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

            foundAppointment = await ctx.prisma.appointment.findFirstOrThrow({
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
            const appointment = await ctx.prisma.appointment.findUniqueOrThrow({
                where: {
                    id: input.id,
                },
                include: {
                    patient: true,
                    therapist: true,
                },
            });
            const patientUser = await clerk.users.getUser(
                appointment.patient.userId,
            );

            await sendPushNotification({
                expoPushToken: patientUser.publicMetadata
                    .expoPushToken as Notification.ExpoPushToken,
                title: "Solicitação de reagendamento",
                body: `${
                    appointment.therapist.name
                } quer reagendar a sessão de ${format(
                    appointment.scheduledTo,
                    "dd/MM 'às' HH:mm",
                )}, clique aqui para escolher um novo horário`,
            });

            return await ctx.prisma.appointment.update({
                where: {
                    id: input.id,
                },
                data: {
                    rescheduleRequested: true,
                },
            });
        }),
    closeRescheduleRequest: protectedProcedure
        .input(
            z.object({
                appointmentId: z.string().min(1),
                newHourId: z.string().min(1).optional(),
                newDate: z.date().optional(),
                keepCurrentHour: z.boolean().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const appointment = await ctx.prisma.appointment.findUniqueOrThrow({
                where: {
                    id: input.appointmentId,
                },
                include: {
                    therapist: true,
                    patient: true,
                },
            });
            const therapistUser = await clerk.users.getUser(
                appointment.therapist.userId,
            );

            if (input.keepCurrentHour) {
                await ctx.prisma.appointment.update({
                    where: {
                        id: input.appointmentId,
                    },
                    data: {
                        rescheduleRequested: false,
                    },
                });
                await sendPushNotification({
                    body: `${appointment.patient.name} escolheu manter o horário da sessão.`,
                    title: "Horário mantido",
                    expoPushToken: therapistUser.publicMetadata
                        .expoPushToken as Notification.ExpoPushToken,
                });

                return;
            }

            if (!input.newHourId || !input.newDate) {
                throw new Error("newHourId and newDate are required");
            }

            const newHour = await ctx.prisma.hour.findUniqueOrThrow({
                where: {
                    id: input.newHourId,
                },
            });

            const newScheduledTo = setHours(input.newDate, newHour.startAt);

            const updatedAppointment = await ctx.prisma.appointment.update({
                where: {
                    id: input.appointmentId,
                },
                data: {
                    hourId: input.newHourId,
                    scheduledTo: newScheduledTo,
                    rescheduleRequested: false,
                },
            });

            await updateAppointmentInCalendar(appointment.eventId ?? "", {
                start: {
                    timeZone: "America/Sao_Paulo",
                    date: updatedAppointment.scheduledTo.toISOString(),
                },
                end: {
                    timeZone: "America/Sao_Paulo",
                    date: addHours(
                        updatedAppointment.scheduledTo,
                        1,
                    ).toISOString(),
                },
            });

            await sendPushNotification({
                body: `${
                    appointment.patient.name
                } escolheu um novo horário para sessão, agora é dia ${format(
                    newScheduledTo,
                    "dd/MM 'às' HH:mm",
                )}`,
                title: "Solicitação de reagendamento aceita",
                expoPushToken: therapistUser.publicMetadata
                    .expoPushToken as Notification.ExpoPushToken,
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

            const therapist = await ctx.prisma.therapist.findUniqueOrThrow({
                where: {
                    id: appointment.therapistId,
                },
                include: {
                    appointments: {
                        where: {
                            status: {
                                in: ["ACCEPTED", "PENDENT"],
                            },
                            scheduledTo: {
                                gte: addDays(appointment.scheduledTo, -3),
                                lte: addDays(appointment.scheduledTo, 3),
                            },
                        },
                    },
                    hours: {
                        where: {
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
                                        lte:
                                            getHours(appointment.scheduledTo) +
                                            1,
                                        gte:
                                            getHours(appointment.scheduledTo) -
                                            1,
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
                    },
                },
            });

            const availableDatesAndHours = getAvailableDatesAndHours({
                therapist,
                numberOfDays: 7,
                startingDate: addDays(appointment.scheduledTo, -3),
            });
            const allAvailableDates = Object.values(
                availableDatesAndHours,
            ).flat();

            const availableHoursOnTheSameDay = allAvailableDates
                .filter((date) => isSameDay(date.date, appointment.scheduledTo))
                .map((date) => date.hours)
                .flat();

            const availableHoursOnDifferentDays = allAvailableDates.filter(
                (date) => !isSameDay(date.date, appointment.scheduledTo),
            );

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
                include: {
                    therapist: true,
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
                        rate: recurrence.therapist.hourlyRate,
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
