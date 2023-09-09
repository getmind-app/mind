import { z } from "zod";

import { type WeekDay } from "@acme/db";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const therapistsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                dateOfBirth: z.date(),
                document: z.string().min(1),
                crp: z.string().min(1),
                phone: z.string().min(1),
                hourlyRate: z.number().positive(),
                yearsOfExperience: z.number().min(0),
                modalities: z.array(z.enum(["ONLINE", "ON_SITE"])),
                about: z.string(),
                userId: z.string().min(1),
                profilePictureUrl: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const therapist = await ctx.prisma.therapist.create({
                data: {
                    ...input,
                    modalities: {
                        set: input.modalities,
                    },
                },
            });

            return therapist;
        }),
    findById: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
            }),
        )
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.therapist.findFirst({
                where: {
                    id: input.id,
                },
                include: {
                    address: true,
                    education: true,
                    methodologies: true,
                    appointments: true,
                    hours: true,
                },
            });
        }),
    findByUserId: protectedProcedure.query(async ({ ctx }) => {
        console.log("ctx.auth");

        return await ctx.prisma.therapist.findFirstOrThrow({
            where: { userId: ctx.auth.userId },
            include: {
                hours: true,
                address: true,
            },
        });
    }),
    findAll: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.therapist.findMany();
    }),
    findByNameLike: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
            }),
        )
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.therapist.findMany({
                where: { name: { contains: input.name, mode: "insensitive" } },
            });
        }),
    setAvailableHours: protectedProcedure
        .input(
            z.object({
                startHour: z.number().min(0).max(23),
                endHour: z.number().min(1).max(24),
                days: z
                    .array(
                        z.enum([
                            "MONDAY",
                            "TUESDAY",
                            "WEDNESDAY",
                            "THURSDAY",
                            "FRIDAY",
                        ]),
                    )
                    .min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const numberOfHourBlocks = input.endHour - input.startHour;

            const therapist = await ctx.prisma.therapist.findUniqueOrThrow({
                where: {
                    userId: ctx.auth.userId,
                },
            });

            const hoursToCreate: {
                startAt: number;
                weekDay: WeekDay;
                therapistId: string;
            }[] = [];

            for (let i = 0; i < input.days.length; i++) {
                await ctx.prisma.hour.deleteMany({
                    where: {
                        AND: {
                            therapistId: ctx.auth.userId,
                            weekDay: input.days[i],
                        },
                    },
                });

                for (let j = 0; j < numberOfHourBlocks; j++) {
                    hoursToCreate.push({
                        startAt: input.startHour + j,
                        weekDay: input.days[i] as WeekDay,
                        therapistId: therapist.id,
                    });
                }
            }

            return await ctx.prisma.hour.createMany({
                data: hoursToCreate,
            });
        }),
    updateAddress: protectedProcedure
        .input(
            z.object({
                street: z.string().min(1),
                number: z.string().min(1),
                complement: z.string().nullable(),
                neighborhood: z.string().min(1),
                city: z.string().min(1),
                state: z.string().min(1),
                country: z.string().min(1),
                zipCode: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const therapist = await ctx.prisma.therapist.findUniqueOrThrow({
                where: {
                    userId: ctx.auth.userId,
                },
                include: {
                    address: true,
                },
            });

            return await ctx.prisma.address.update({
                where: {
                    id: therapist.address?.id,
                },
                data: {
                    ...input,
                },
            });
        }),
    update: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                dateOfBirth: z.date(),
                document: z.string().min(1),
                crp: z.string().min(1),
                phone: z.string().min(1),
                hourlyRate: z.number().positive(),
                yearsOfExperience: z.number().min(0),
                about: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const therapist = await ctx.prisma.therapist.findUniqueOrThrow({
                where: {
                    userId: ctx.auth.userId,
                },
            });

            return await ctx.prisma.therapist.update({
                where: {
                    id: therapist.id,
                },
                data: input,
            });
        }),
});
