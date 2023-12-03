import clerkClient from "@clerk/clerk-sdk-node";
import { Resend } from "resend";
import { z } from "zod";

import { type Therapist, type WeekDay } from "@acme/db";

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

            const user = await clerkClient.users.getUser(ctx.auth.userId);
            const resend = new Resend(process.env.RESEND_SECRET_KEY);

            await resend.emails.send({
                from: "Mind <email@getmind.app>",
                to: ["abdul@getmind.app", "gustavo@getmind.app"],
                subject: `New therapist, ${input.name}, joined Mind!`,
                text: `Hi there! ${
                    input.name
                } just joined Mind! Please follow with the onboarding process.
                Name: ${input.name}
                Email: ${user.emailAddresses[0]?.emailAddress}
                ${JSON.stringify(input, null, 2)}`,
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
                where: {
                    name: { contains: input.name, mode: "insensitive" },
                    paymentAccountStatus: "ACTIVE",
                    status: "ACCEPTED",
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
            });

            const hoursToCreate: {
                startAt: number;
                weekDay: WeekDay;
                therapistId: string;
            }[] = [];

            for (let i = 0; i < input.days.length; i++) {
                await ctx.prisma.hour.deleteMany({
                    where: {
                        weekDay: input.days[i] as WeekDay,
                        therapistId: therapist.id,
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
                name: z.string().min(1),
                dateOfBirth: z.date(),
                document: z.string().min(1),
                crp: z.string().min(1),
                phone: z.string().min(1),
                hourlyRate: z.number().positive(),
                yearsOfExperience: z.string().min(1),
                about: z.string().nullable(),
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
                    appointments: true,
                },
            });

            return getAvailableDatesAndHours(therapist);
        }),
});

const getAvailableDatesAndHours = (
    therapist: Therapist & {
        hours: { startAt: number; weekDay: WeekDay }[];
        appointments: { scheduledTo: Date; status: string }[];
    },
) => {
    const weekDayMap: Record<WeekDay, number> = {
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
    };

    const availableDatesAndHoursInCurrentAndNextMonth: {
        month: string;
        monthIndex: number;
        dates: {
            date: Date;
            hours: number[];
        }[];
    }[] = [];

    const currentDate = new Date();
    const thirtyDaysFromNow = new Date(currentDate);
    thirtyDaysFromNow.setDate(currentDate.getDate() + 30);

    const currentDateCopy = new Date(currentDate);

    const availableDatesAndHoursForCurrentMonth = [];
    const availableDatesAndHoursForNextMonth = [];

    while (currentDateCopy <= thirtyDaysFromNow) {
        if (
            currentDateCopy.getDay() !== 0 && // Sunday
            currentDateCopy.getDay() !== 6 && // Saturday
            therapist.hours.some(
                // Therapist works on this day
                (hour) => weekDayMap[hour.weekDay] === currentDateCopy.getDay(),
            )
        ) {
            // The hours that this therapist works on this day
            const hours = therapist.hours
                .filter(
                    (hour) =>
                        weekDayMap[hour.weekDay] === currentDateCopy.getDay(),
                )
                .map((hour) => hour.startAt);

            // Check every hour if there is an appointment
            // If there is, remove it from the available hours

            for (let i = 0; i < therapist.appointments.length; i++) {
                const appointment = therapist.appointments[i];

                if (
                    appointment?.scheduledTo.getDate() ===
                        currentDateCopy.getDate() &&
                    appointment?.scheduledTo.getMonth() ===
                        currentDateCopy.getMonth() &&
                    appointment.scheduledTo.getFullYear() ===
                        currentDateCopy.getFullYear() &&
                    appointment.status === "ACCEPTED"
                ) {
                    const appointmentHour = appointment.scheduledTo.getHours();

                    const index = hours.indexOf(appointmentHour);

                    if (index > -1) {
                        hours.splice(index, 1);
                    }
                }
            }

            // Remove all days that have no available hours
            if (hours.length === 0) {
                currentDateCopy.setDate(currentDateCopy.getDate() + 1);
                continue;
            }

            if (currentDateCopy.getMonth() === currentDate.getMonth()) {
                availableDatesAndHoursForCurrentMonth.push({
                    date: new Date(currentDateCopy),
                    hours,
                });
            } else {
                availableDatesAndHoursForNextMonth.push({
                    date: new Date(currentDateCopy),
                    hours,
                });
            }
        }
        currentDateCopy.setDate(currentDateCopy.getDate() + 1);
    }

    availableDatesAndHoursInCurrentAndNextMonth.push({
        month: currentDate.toLocaleString("default", { month: "long" }),
        monthIndex: currentDate.getMonth(),
        dates: availableDatesAndHoursForCurrentMonth,
    });

    availableDatesAndHoursInCurrentAndNextMonth.push({
        month: thirtyDaysFromNow.toLocaleString("default", { month: "long" }),
        monthIndex: thirtyDaysFromNow.getMonth(),
        dates: availableDatesAndHoursForNextMonth,
    });

    return availableDatesAndHoursInCurrentAndNextMonth;
};
