import { createTRPCRouter, protectedProcedure } from "../trpc";

export const hoursRouter = createTRPCRouter({
    hasSetUpWorkHours: protectedProcedure.query(async ({ ctx }) => {
        const hoursCount = await ctx.prisma.hour.count({
            where: {
                Therapist: {
                    userId: ctx.auth.userId,
                },
            },
        });

        return {
            hasSetUpWorkHours: hoursCount > 0,
        };
    }),
});
