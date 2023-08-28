import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const waitlistRouter = createTRPCRouter({
    create: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            return await ctx.prisma.email.create({
                data: {
                    email: input.email,
                },
            });
        }),
});
