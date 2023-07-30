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
        hourlyRate: z.number().positive(),
        yearsOfExperience: z.number().min(0),
        about: z.string(),
        userId: z.string().min(1),
        profilePictureUrl: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.therapist.create({ data: input });
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
          education: true,
          methodologies: true,
          appointments: true,
          hours: true,
        },
      });
    }),
  findByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.therapist.findFirst({
        where: { userId: input.userId },
        include: {
          hours: true,
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
        where: { name: { contains: input.name } },
      });
    }),
  setAvailableHours: protectedProcedure
    .input(
      z.object({
        startHour: z.number().min(0).max(23),
        endHour: z.number().min(1).max(24),
        days: z
          .array(
            z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
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
});
