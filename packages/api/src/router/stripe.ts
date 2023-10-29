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
    createSetupIntent: protectedProcedure
        .input(
            z.object({
                amount: z.number(),
                currency: z.string(),
                payment_method_types: z.array(z.string()),
                therapistPaymentAccountId: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const patient = await ctx.prisma.patient.findUnique({
                where: {
                    userId: ctx.auth.userId,
                },
            });

            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
                apiVersion: "2023-08-16",
            });

            const customer = patient?.paymentAccountId
                ? await stripe.customers.retrieve(patient.paymentAccountId)
                : await stripe.customers.create({
                      email: patient?.email,
                      name: patient?.name,
                  });

            const ephemeralKey = await stripe.ephemeralKeys.create(
                { customer: customer.id },
                { apiVersion: "2022-08-01" },
            );

            const setupIntent = await stripe.setupIntents.create({
                customer: customer.id,
                payment_method_types: ["card"],
            });

            return { setupIntent, ephemeralKey, customer };
        }),
    createPaymentIntent: protectedProcedure
        .input(
            z.object({
                amount: z.number(),
                currency: z.string(),
                payment_method_types: z.array(z.string()),
                therapistPaymentAccountId: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            console.log("createPaymentIntent");

            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
                apiVersion: "2023-08-16",
            });

            const customer = await stripe.customers.create({
                email: ctx.auth.user?.emailAddresses[0]?.emailAddress,
                name: `${ctx.auth.user?.firstName} ${ctx.auth.user?.lastName}`,
            });

            const ephemeralKey = await stripe.ephemeralKeys.create(
                { customer: customer.id },
                { apiVersion: "2022-08-01" },
            );
            const FIXED_APPLICATION_FEE = 0.1;

            const paymentIntent = await stripe.paymentIntents.create({
                amount: input.amount,
                currency: input.currency,
                automatic_payment_methods: {
                    enabled: true,
                },
                transfer_data: {
                    destination: input.therapistPaymentAccountId,
                },
                application_fee_amount: input.amount * FIXED_APPLICATION_FEE,
            });

            return { paymentIntent, ephemeralKey, customer };
        }),
    createAccount: protectedProcedure.mutation(async ({ ctx }) => {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2023-08-16",
        });

        const newAccountData = await stripe.accounts.create({
            type: "express",
        });

        const therapist = await ctx.prisma.therapist.update({
            where: {
                userId: ctx.auth.userId,
            },
            data: {
                paymentAccountId: newAccountData.id,
            },
        });

        return therapist;
    }),
    linkAccount: protectedProcedure
        .input(
            z.object({
                therapistPaymentAccountId: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
                apiVersion: "2023-08-16",
            });

            const accountLink = await stripe.accountLinks.create({
                account: input.therapistPaymentAccountId,
                refresh_url: "http://localhost:3000/refresh",
                return_url:
                    process.env.PROFILE! === "production"
                        ? "https://getmind.app/redirect?redirectUrl=mind:///settings/payment-setup?success=true"
                        : "http://localhost:3000/redirect?redirectUrl=exp://192.168.100.91:8081/settings/payment-setup?success=true",
                type: "account_onboarding",
            });

            return accountLink;
        }),
    getAccount: protectedProcedure
        .input(
            z.object({
                paymentAccountId: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
                apiVersion: "2023-08-16",
            });

            const account = await stripe.accounts.retrieve(
                input.paymentAccountId,
            );

            return account;
        }),
    updateAccountStatus: protectedProcedure.mutation(async ({ ctx }) => {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2023-08-16",
        });

        const therapist = await ctx.prisma.therapist.findUnique({
            where: {
                userId: ctx.auth.userId,
            },
        });

        if (therapist?.paymentAccountStatus === "UNACTIVE") {
            const account = await stripe.accounts.retrieve(
                therapist?.paymentAccountId!,
            );

            if (
                account.external_accounts?.data?.length &&
                account.external_accounts?.data?.length > 0
            ) {
                const externalAccount = account.external_accounts?.data[0];

                if (externalAccount?.status !== "errored") {
                    await ctx.prisma.therapist.update({
                        where: {
                            userId: ctx.auth.userId,
                        },
                        data: {
                            paymentAccountStatus: "ACTIVE",
                        },
                    });
                }
            }
        }
    }),
});
