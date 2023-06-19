import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const appointmentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        scheduledTo: z.date(),
        modality: z.enum(["ONLINE", "ON_SITE"]),
        therapistId: z.string().min(1),
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.appointment.create({ data: input });
    }),
  findLastByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const appointments = await ctx.prisma.appointment.findMany({
        where: {
          userId: input.userId,
          scheduledTo: {
            gte: new Date(),
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
        take: 1,
      });

      return appointments.length > 0 ? appointments.at(0) : null;
    }),
  findByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.appointment.findMany({
        where: {
          userId: input.userId,
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
});
