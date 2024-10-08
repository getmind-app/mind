import clerk from "@clerk/clerk-sdk-node";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const usersRouter = createTRPCRouter({
    getSession: publicProcedure.query(({ ctx }) => {
        return ctx.auth;
    }),
    setMetadata: protectedProcedure
        .input(
            z.object({
                metadata: z.object({
                    role: z.enum(["patient", "professional"]).optional(),
                    expoPushToken: z.string().optional(),
                }),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            console.time("updateUserMetadata");

            try {
                const user = await clerk.users.updateUserMetadata(
                    ctx.auth.userId,
                    {
                        publicMetadata: input.metadata,
                    },
                );
                return user;
            } catch (e) {
                console.log(e);
                return {
                    error: e,
                    message: "Failed to update user metadata",
                };
            } finally {
                console.timeEnd("updateUserMetadata");
            }
        }),
    userHasProfileImage: protectedProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input }) => {
            const user = await clerk.users.getUser(input.userId);
            const { ok } = await fetch(user.imageUrl);

            return {
                ok,
                imageUrl: user.imageUrl,
            };
        }),
    updateProfileImage: protectedProcedure
        .input(z.object({ url: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const user = await clerk.users.getUser(ctx.auth.userId);

            const isProfessional = user.publicMetadata?.role === "professional";

            if (isProfessional) {
                return ctx.prisma.therapist.update({
                    where: {
                        userId: ctx.auth.userId,
                    },
                    data: {
                        profilePictureUrl: input.url,
                    },
                });
            }

            return ctx.prisma.patient.update({
                where: {
                    userId: ctx.auth.userId,
                },
                data: {
                    profilePictureUrl: input.url,
                },
            });
        }),
    clearMetadata: protectedProcedure.mutation(async ({ ctx }) => {
        try {
            console.log("clearMetadata", ctx.auth.userId);
            await Promise.all([
                ctx.prisma.patient.deleteMany({
                    where: {
                        OR: [
                            {
                                userId: ctx.auth.userId,
                            },
                            {
                                email: ctx.auth.user?.emailAddresses[0]
                                    ?.emailAddress,
                            },
                        ],
                    },
                }),
                ctx.prisma.therapist.delete({
                    where: {
                        userId: ctx.auth.userId,
                    },
                }),
            ]);

            const user = await clerk.users.updateUserMetadata(ctx.auth.userId, {
                publicMetadata: {
                    role: null,
                },
            });
            return user;
        } catch (e) {
            console.log(e);
            return {
                error: e,
                message: "Failed to clear user metadata",
            };
        }
    }),
    findByUserId: protectedProcedure
        .input(
            z.object({
                userId: z.string().min(1),
            }),
        )
        .query(async ({ input }) => {
            return await clerk.users.getUser(input.userId);
        }),
});
