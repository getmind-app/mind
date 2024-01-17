import type * as Notification from "expo-notifications";
import clerk, { type User } from "@clerk/clerk-sdk-node";
import { addHours, format } from "date-fns";
import { z } from "zod";

import {
    type Address,
    type Appointment,
    type AppointmentStatus,
    type Patient,
    type Therapist,
    type WeekDay,
} from "@acme/db";

import { createFirstAppointmentsInRecurrence } from "../appointments/createFirstAppointmentsInRecurrence";
import { cancelAppointmentInCalendar } from "../helpers/cancelAppointmentInCalendar";
import { createAppointmentInCalendar } from "../helpers/createAppointmentInCalendar";
import { sendPushNotification } from "../helpers/sendPushNotification";
import { notifyAppointmentStatusChange } from "../notifications/notifyAppointmentStatusChange";
import { payForAppointment } from "../payments/payForAppointment";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const appointmentsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                scheduledTo: z.date(),
                modality: z.enum(["ONLINE", "ON_SITE"]),
                therapistId: z.string().min(1),
                patientId: z.string().min(1),
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
                throw new Error("Couldn't find therapist");
            }

            if (!patient?.userId) {
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
                    scheduledTo: input.scheduledTo,
                    therapistId: input.therapistId,
                    patientId: input.patientId,
                    type: input.repeat ? "FIRST_IN_RECURRENCE" : "SINGLE",
                },
            });
        }),
    findNextUserAppointment: protectedProcedure.query(async ({ ctx }) => {
        let foundAppointment;

        if (ctx.auth.user?.publicMetadata?.role === "professional") {
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
                    scheduledTo: "desc",
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
                    scheduledTo: "desc",
                },
            });

            return foundAppointment;
        }
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
        let foundAppointment;

        if (ctx.auth.user?.publicMetadata?.role === "professional") {
            const therapist = await ctx.prisma.therapist.findFirst({
                where: { userId: ctx.auth.userId },
            });

            foundAppointment = await ctx.prisma.appointment.findMany({
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
                    scheduledTo: "desc",
                },
            });
        } else {
            const patient = await ctx.prisma.patient.findFirst({
                where: { userId: ctx.auth.userId },
            });

            foundAppointment = await ctx.prisma.appointment.findMany({
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
                    scheduledTo: "desc",
                },
            });

            return foundAppointment;
        }
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
                await payForAppointment({ appointment, prisma: ctx.prisma });

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
});
