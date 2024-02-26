import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const notesRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                content: z.string().min(1),
                patientId: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.note.create({
                data: {
                    ...input,
                    userId: ctx.auth.userId,
                },
            });
        }),
    nextSessionNotes: protectedProcedure
        .input(
            z
                .object({
                    therapistId: z.string().min(1),
                    patientId: z.string().min(1),
                })
                .optional(),
        )
        .query(async ({ ctx, input }) => {
            if (!input) {
                const notes = await ctx.prisma.note.findMany({
                    where: { userId: ctx.auth.userId },
                    orderBy: {
                        createdAt: "desc",
                    },
                });

                return notes;
            }

            const therapistNotesOnPatient = await ctx.prisma.note.findMany({
                where: {
                    userId: input.therapistId,
                    patientId: input.patientId,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            return therapistNotesOnPatient;
        }),
    findByUserId: protectedProcedure.query(async ({ ctx }) => {
        const notes = await ctx.prisma.note.findMany({
            where: { userId: ctx.auth.userId },
            orderBy: {
                createdAt: "desc",
            },
        });

        return notes;
    }),
    delete: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.note.delete({ where: { id: input.id } });
        }),
    findById: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
            }),
        )
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.note.findUnique({
                where: { id: input.id },
            });
        }),
});
