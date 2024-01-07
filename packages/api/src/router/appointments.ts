import type * as Notification from "expo-notifications";
import clerk, { type User } from "@clerk/clerk-sdk-node";
import { addHours, format } from "date-fns";
import Stripe from "stripe";
import { z } from "zod";

import {
    type Address,
    type Appointment,
    type AppointmentStatus,
    type Patient,
    type Therapist,
    type WeekDay,
} from "@acme/db";

import { cancelAppointmentInCalendar } from "../helpers/cancelAppointmentInCalendar";
import { createAppointmentInCalendar } from "../helpers/createAppointmentInCalendar";
import { sendPushNotification } from "../helpers/sendPushNotification";
import { createTRPCRouter, protectedProcedure } from "../trpc";

async function updateAppointmentStatusNotificationMessage({
    therapistUser,
    therapist,
    patientUser,
    patient,
    status,
    scheduledTo,
}: {
    therapistUser: User;
    patientUser: User;
    patient: Patient;
    therapist: Therapist;
    status: AppointmentStatus;
    scheduledTo: Date;
}) {
    const [date, hour] = format(scheduledTo, "dd HH");

    if (status === "PENDENT") {
        return;
    }

    if (status === "CANCELED") {
        await sendPushNotification({
            expoPushToken: therapistUser.publicMetadata
                .expoPushToken as Notification.ExpoPushToken,
            title: "Sessão cancelada ❌",
            body: `${patient.name} cancelou a sessão no dia ${date} às ${hour}h.`,
        });
        return;
    }

    if (status === "REJECTED") {
        await sendPushNotification({
            expoPushToken: patientUser.publicMetadata
                .expoPushToken as Notification.ExpoPushToken,
            title: "Sessão cancelada ❌",
            body: `${therapist.name} não vai poder atender você no dia ${date} às ${hour}h.`,
        });
        return;
    }

    if (status === "ACCEPTED") {
        await sendPushNotification({
            expoPushToken: patientUser.publicMetadata
                .expoPushToken as Notification.ExpoPushToken,
            title: "Sessão confirmada! 🎉",
            body: `${therapist.name} aceitou sua sessão no dia ${date} às ${hour}h.`,
        });
        return;
    }

    const _exhaustive: never = status;
}

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

            return recurrence;
        }),
    // TODO: esse endpoint precisa ser refatorado urgentemente kkkkkkk
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
            let calendarEvent: null | Awaited<
                ReturnType<typeof createAppointmentInCalendar>
            > = null;

            if (input.status === "PENDENT") {
                throw new Error("Cannot update appointment status to PENDENT");
            }

            const therapist = await ctx.prisma.therapist.findUniqueOrThrow({
                where: {
                    id: input.therapistId,
                },
                include: {
                    address: true,
                },
            });

            const patient = await ctx.prisma.patient.findUniqueOrThrow({
                where: {
                    id: input.patientId,
                },
            });

            const patientUser = await clerk.users.getUser(patient.userId);
            const therapistUser = await clerk.users.getUser(therapist.userId);

            const appointment = await ctx.prisma.appointment.findUniqueOrThrow({
                where: {
                    id: input.id,
                },
            });

            if (input.status === "ACCEPTED") {
                await handleAppointmentPayment({ therapist, patient });

                calendarEvent = await createAppointmentInCalendar(
                    therapist as Therapist & { address: Address },
                    therapistUser.emailAddresses[0]?.emailAddress ?? "",
                    appointment,
                    patient,
                );
            } else if (input.status === "CANCELED") {
                await cancelAppointmentInCalendar(appointment?.eventId ?? "");
            }

            await updateAppointmentStatusNotificationMessage({
                status: input.status,
                scheduledTo: input.scheduledTo,
                patient,
                patientUser,
                therapist,
                therapistUser,
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
async function handleAppointmentPayment({
    therapist,
    patient,
}: {
    therapist: Therapist & { address: Address | null };
    patient: Patient;
}) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2023-08-16",
    });

    if (!therapist.paymentAccountId) {
        throw new Error("Missing payment account id for therapist");
    }

    if (!patient.paymentAccountId) {
        throw new Error("Missing payment account id for patient");
    }

    if (!therapist.hourlyRate) {
        throw new Error("Missing payment account id for patient");
    }

    if (!process.env.FIXED_APPLICATION_FEE) {
        throw new Error("Missing application fee");
    }

    const paymentMethod = await stripe.customers.listPaymentMethods(
        patient.paymentAccountId,
        {
            limit: 1,
        },
    );

    if (!paymentMethod.data || !paymentMethod.data[0]) {
        throw new Error("Missing payment method");
    }

    const paymentResponse = await stripe.paymentIntents.create({
        customer: patient.paymentAccountId,
        confirm: true,
        description: "Appointment payment",
        currency: "brl",
        amount: therapist.hourlyRate * 100,
        payment_method: paymentMethod.data[0].id,
        transfer_data: {
            destination: therapist.paymentAccountId,
        },
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
        },
        application_fee_amount:
            parseFloat(process.env.FIXED_APPLICATION_FEE) *
            100 *
            therapist.hourlyRate,
    });

    if (paymentResponse.status !== "succeeded") {
        throw new Error("Payment failed");
    }
}
