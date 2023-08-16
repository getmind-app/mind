import { z } from "zod";

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
                        not: "CANCELED" || "REJECTED" || "PENDENT",
                    },
                },
                include: {
                    therapist: {
                        include: {
                            address: true,
                        },
                    },
                },
                orderBy: {
                    scheduledTo: "desc",
                },
            });
        } else {
            foundAppointment = await ctx.prisma.appointment.findFirst({
                where: {
                    userId: ctx.auth.userId,
                    scheduledTo: {
                        gte: new Date(),
                    },
                    status: {
                        not: "CANCELED" || "REJECTED" || "PENDENT",
                    },
                },
                include: {
                    therapist: {
                        include: {
                            address: true,
                        },
                    },
                },
                orderBy: {
                    scheduledTo: "desc",
                },
            });

            return foundAppointment;
        }
    }),
    findByUserId: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.appointment.findMany({
            where: {
                userId: ctx.auth.userId,
            },
            include: {
                therapist: true,
            },
            orderBy: {
                scheduledTo: "desc",
            },
        });
    }),
    findById: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
            }),
        )
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.appointment.findUnique({
                where: {
                    id: input.id,
                },
                include: {
                    therapist: true,
                },
            });
        }),
    findByTherapistId: protectedProcedure
        .input(
            z.object({
                therapistId: z.string().min(1),
            }),
        )
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.appointment.findMany({
                where: {
                    therapistId: input.therapistId,
                },
                include: {
                    therapist: true,
                },
                orderBy: {
                    scheduledTo: "desc",
                },
            });
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
                userId: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.appointment.update({
                where: {
                    id: input.id,
                },
                data: input,
            });
        }),
});
