import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const patientsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                email: z.string().email(),
                profilePictureUrl: z.string().url(),
                userId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.patient.create({ data: input });
        }),
    findByUserId: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.patient.findFirst({
            where: {
                userId: ctx.auth.userId,
            },
        });
    }),
});
