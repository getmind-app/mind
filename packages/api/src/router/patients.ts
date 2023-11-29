import Stripe from "stripe";
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
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
                apiVersion: "2023-08-16",
            });

            const customer = await stripe.customers.create({
                email: input.email,
                name: input.name,
            });

            return await ctx.prisma.patient.create({
                data: {
                    ...input,
                    paymentAccountId: customer.id,
                },
            });
        }),
    findByUserId: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.patient.findFirst({
            where: {
                userId: ctx.auth.userId,
            },
        });
    }),
});
