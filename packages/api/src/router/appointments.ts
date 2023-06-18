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
        orderBy: {
          scheduledTo: "asc",
        },
        take: 1,
      });

      return appointments.at(0);
    }),
});
