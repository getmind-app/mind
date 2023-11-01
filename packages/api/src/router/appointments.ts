import type * as Notification from "expo-notifications";
import clerk from "@clerk/clerk-sdk-node";
import Stripe from "stripe";
import { z } from "zod";

import { sendPushNotification } from "../helpers/sendPushNotification";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const appointmentsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                scheduledTo: z.date(),
                modality: z.enum(["ONLINE", "ON_SITE"]),
                therapistId: z.string().min(1),
                patientId: z.string().min(1),
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

            const therapistUser = await clerk.users.getUser(
                therapist?.userId ?? "",
            );

            await sendPushNotification({
                expoPushToken: therapistUser.publicMetadata
                    .expoPushToken as Notification.ExpoPushToken,
                title: "New appointment! 🎉",
                body: `${patient?.name} requested an appointment with you.`,
            });

            return await ctx.prisma.appointment.create({ data: input });
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
            if (input.status !== "PENDENT") {
                const therapist = await ctx.prisma.therapist.findUnique({
                    where: {
                        id: input.therapistId,
                    },
                });

                const patient = await ctx.prisma.patient.findUnique({
                    where: {
                        id: input.patientId,
                    },
                });

                const patientUser = await clerk.users.getUser(
                    patient?.userId ?? "",
                );

                const notificationMapper: {
                    [key in "ACCEPTED" | "REJECTED" | "CANCELED"]: {
                        title: string;
                        body: string;
                    };
                } = {
                    ACCEPTED: {
                        title: "Appointment accepted! 🎉",
                        body: `${therapist?.name} accepted your appointment request.`,
                    },
                    REJECTED: {
                        title: "Appointment rejected ❌",
                        body: `${therapist?.name} rejected your appointment request.`,
                    },
                    CANCELED: {
                        title: "Appointment canceled ❌",
                        body: `${therapist?.name} canceled your appointment.`,
                    },
                };

                if (input.status === "ACCEPTED") {
                    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
                        apiVersion: "2023-08-16",
                    });

                    if (!therapist?.paymentAccountId) {
                        throw new Error(
                            "Missing payment account id for therapist",
                        );
                    }

                    if (!patient?.paymentAccountId) {
                        throw new Error(
                            "Missing payment account id for patient",
                        );
                    }

                    if (!therapist?.hourlyRate) {
                        throw new Error(
                            "Missing payment account id for patient",
                        );
                    }

                    if (!process.env.FIXED_APPLICATION_FEE) {
                        throw new Error("Missing application fee");
                    }

                    const paymentMethod =
                        await stripe.customers.listPaymentMethods(
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

                await sendPushNotification({
                    expoPushToken: patientUser.publicMetadata
                        .expoPushToken as Notification.ExpoPushToken,
                    title: notificationMapper[input.status]["title"],
                    body: notificationMapper[input.status]["body"],
                });
            }

            return await ctx.prisma.appointment.update({
                where: {
                    id: input.id,
                },
                data: input,
            });
        }),
});
