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
});
