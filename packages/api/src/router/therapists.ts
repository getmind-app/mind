import { addDays } from "date-fns";
import { z } from "zod";

import { type Prisma, type WeekDay } from "@acme/db";

import calculateBoundingBox from "../helpers/calculateBoundingBox";
import { getAvailableDatesAndHours } from "../therapist/getAvailableDatesAndHours";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const therapistsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                dateOfBirth: z.date(),
                document: z.string().min(1),
                crp: z.string().min(1),
                gender: z.enum(["MALE", "FEMALE"]),
                phone: z.string().min(1),
                hourlyRate: z.number().positive(),
                modalities: z.array(z.enum(["ONLINE", "ON_SITE"])),
                userId: z.string().min(1),
                profilePictureUrl: z.string().min(1),
                pixKey: z.string().optional(),
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
                    appointments: true,
                    hours: true,
                },
            });
        }),
    findByUserId: protectedProcedure.query(async ({ ctx }) => {
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
    findWithFilters: protectedProcedure
        .input(
            z.object({
                name: z.string().nullable(),
                priceRange: z
                    .object({
                        min: z.number().positive(),
                        max: z.number().positive(),
                    })
                    .nullable(),
                gender: z.array(z.enum(["MALE", "FEMALE"])).nullable(),
                modalities: z.array(z.enum(["ONLINE", "ON_SITE"])).nullable(),
                distance: z.number().positive().nullable(),
                currentLocation: z
                    .object({
                        latitude: z.number(),
                        longitude: z.number(),
                    })
                    .nullable(),
                methodologies: z.array(z.string()).nullable(),
            }),
        )
        .query(async ({ ctx, input }) => {
            let whereClause: Prisma.TherapistWhereInput = {
                // paymentAccountStatus: "ACTIVE",
            };

            const orderByClause: Prisma.TherapistOrderByWithAggregationInput =
                {};

            if (input.name && input.name.length > 0) {
                whereClause = {
                    ...whereClause,
                    name: { contains: input.name, mode: "insensitive" },
                };
            }

            if (input.priceRange) {
                whereClause = {
                    ...whereClause,
                    hourlyRate: {
                        gte: input.priceRange.min,
                        lte: input.priceRange.max,
                    },
                };
            }

            if (input.gender && input.gender.length > 0) {
                whereClause = {
                    ...whereClause,
                    gender: {
                        in: input.gender,
                    },
                };
            }

            if (input.modalities && input.modalities.length > 0) {
                whereClause = {
                    ...whereClause,
                    modalities: {
                        hasSome: input.modalities,
                    },
                };
            }

            if (input.methodologies && input.methodologies.length > 0) {
                whereClause = {
                    ...whereClause,
                    methodologies: {
                        hasSome: input.methodologies,
                    },
                };
            }

            if (input.distance && input.currentLocation) {
                const { latitude, longitude } = input.currentLocation;

                const boundingBox = calculateBoundingBox(
                    latitude,
                    longitude,
                    input.distance,
                );

                whereClause = {
                    ...whereClause,
                    address: {
                        latitude: {
                            gte: boundingBox.minLat,
                            lte: boundingBox.maxLat,
                        },
                        longitude: {
                            gte: boundingBox.minLon,
                            lte: boundingBox.maxLon,
                        },
                    },
                };
            }

            return await ctx.prisma.therapist.findMany({
                where: whereClause,
                orderBy: orderByClause,
                include: {
                    address: true,
                },
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
                include: {
                    hours: {
                        where: {
                            OR: input.days.map((day) => ({
                                weekDay: day as WeekDay,
                            })),
                        },
                    },
                },
            });

            const newHours: Prisma.HourCreateManyInput[] = [];

            for (let i = 0; i < input.days.length; i++) {
                const day = input.days[i] as WeekDay;
                const therapistHoursOnThisDay = therapist.hours.filter(
                    (hour) => hour.weekDay === day,
                );

                for (let j = 0; j < numberOfHourBlocks; j++) {
                    const startAt = input.startHour + j;

                    const hourAlreadyExists = therapistHoursOnThisDay.some(
                        (hour) => hour.startAt === startAt,
                    );

                    if (!hourAlreadyExists) {
                        newHours.push({
                            startAt,
                            weekDay: day,
                            therapistId: therapist.id,
                        });
                    }
                }
            }

            return await ctx.prisma.hour.createMany({
                data: newHours,
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
                latitude: z.number(),
                longitude: z.number(),
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

            if (therapist.address) {
                return await ctx.prisma.address.update({
                    where: {
                        id: therapist.address?.id,
                    },
                    data: {
                        ...input,
                    },
                });
            } else {
                return await ctx.prisma.address.create({
                    data: {
                        ...input,
                        therapistId: therapist.id,
                    },
                });
            }
        }),
    update: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1).optional(),
                dateOfBirth: z.date().optional(),
                document: z.string().min(1).optional(),
                crp: z.string().min(1).optional(),
                phone: z.string().min(1).optional(),
                hourlyRate: z.number().positive().optional(),
                yearsOfExperience: z.string().optional(),
                about: z.string().optional().nullable(),
                methodologies: z.array(z.string()).optional(),
                education: z.string().optional().nullable(),
                pixKey: z.string().optional().nullable(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const therapist = await ctx.prisma.therapist.findUniqueOrThrow({
                where: {
                    userId: ctx.auth.userId,
                },
            });

            input.yearsOfExperience = input.yearsOfExperience ?? "0";

            return await ctx.prisma.therapist.update({
                where: {
                    id: therapist.id,
                },
                data: {
                    ...input,
                    ...(input.methodologies
                        ? {
                              methodologies: {
                                  set: input.methodologies,
                              },
                          }
                        : {}),
                },
            });
        }),
    getAvailableDatesAndHours: protectedProcedure
        .input(
            z.object({
                therapistId: z.string().min(1),
            }),
        )
        .query(async ({ ctx, input }) => {
            const therapist = await ctx.prisma.therapist.findUniqueOrThrow({
                where: {
                    id: input.therapistId,
                },
                include: {
                    hours: true,
                    appointments: {
                        where: {
                            status: {
                                in: ["ACCEPTED", "PENDENT"],
                            },
                            scheduledTo: {
                                gte: new Date(),
                                lte: addDays(new Date(), 30),
                            },
                        },
                    },
                },
            });

            return getAvailableDatesAndHours({ therapist });
        }),
    pendentRecurrences: protectedProcedure.query(async ({ ctx }) => {
        const therapist = await ctx.prisma.therapist.findUniqueOrThrow({
            where: {
                userId: ctx.auth.userId,
            },
        });

        if (!therapist) {
            throw new Error("Therapist not found");
        }

        const recurrences = await ctx.prisma.recurrence.findMany({
            where: {
                status: "PENDENT",
                therapistId: therapist.id,
            },
        });

        return recurrences;
    }),
    recurrences: protectedProcedure.query(async ({ ctx }) => {
        const therapist = await ctx.prisma.therapist.findUniqueOrThrow({
            where: {
                userId: ctx.auth.userId,
            },
        });

        if (!therapist) {
            throw new Error("Therapist not found");
        }
        const recurrences = await ctx.prisma.recurrence.findMany({
            where: {
                therapistId: therapist.id,
            },
            include: {
                therapist: true,
                patient: true,
            },
        });

        return recurrences;
    }),
});
