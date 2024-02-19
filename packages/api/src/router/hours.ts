import { createTRPCRouter, protectedProcedure } from "../trpc";

export const hoursRouter = createTRPCRouter({
    hasSetUpWorkHours: protectedProcedure.query(async ({ ctx }) => {
        const therapist = await ctx.prisma.therapist.findUnique({
            where: {
                userId: ctx.auth.userId,
            },
            select: {
                hours: true,
            },
        });

        return {
            hasSetUpWorkHours: !!therapist?.hours,
        };
    }),
});
