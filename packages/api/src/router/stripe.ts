import { Stripe } from "stripe";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const stripeRouter = createTRPCRouter({
    getPaymentSheetParams: protectedProcedure.query(async () => {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2023-08-16",
        });

        const customer = await stripe.customers.create();

        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: "2022-08-01" },
        );
        const setupIntent = await stripe.setupIntents.create({
            customer: customer.id,
        });
        return {
            setupIntent: setupIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
        };
    }),
    createPaymentIntent: protectedProcedure
        .input(
            z.object({
                amount: z.number(),
                currency: z.string(),
                payment_method_types: z.array(z.string()),
            }),
        )
        .mutation(async ({ input }) => {
            console.log("createPaymentIntent");

            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
                apiVersion: "2023-08-16",
            });

            const paymentIntent = await stripe.paymentIntents.create({
                amount: input.amount,
                currency: input.currency,
                payment_method_types: input.payment_method_types,
            });

            return {
                clientSecret: paymentIntent.client_secret,
            };
        }),
});
