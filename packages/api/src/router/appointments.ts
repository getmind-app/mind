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
});
