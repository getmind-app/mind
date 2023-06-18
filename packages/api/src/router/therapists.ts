import { z } from "zod";

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
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.therapist.create({ data: input });
    }),
  findByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.therapist.findFirst({
        where: { userId: input.userId },
      });
    }),
  findAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.therapist.findMany();
  }),
});
