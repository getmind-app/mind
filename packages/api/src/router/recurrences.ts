import { z } from "zod";

import { checkForRecurrenceConflict } from "../appointments/checkForRecurrenceConflict";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const recurrenceRouter = createTRPCRouter({
    checkRecurrenceCanHappen: protectedProcedure
        .input(
            z.object({
                therapistId: z.string(),
                scheduledTo: z.date(),
            }),
        )
        .query(async ({ ctx, input }) => {
            return !(await checkForRecurrenceConflict({
                prisma: ctx.prisma,
                therapistId: input.therapistId,
                scheduledTo: input.scheduledTo,
            }));
        }),
    allUserRecurrences: protectedProcedure
        .input(z.object({ userRole: z.enum(["professional", "patient"]) }))
        .query(async ({ ctx, input }) => {
            if (input.userRole === "professional") {
                const therapist = await ctx.prisma.therapist.findUnique({
                    where: { userId: ctx.auth.userId },
                });

                if (!therapist) {
                    throw new Error("Therapist not found");
                }

                try {
                    return await ctx.prisma.recurrence.findMany({
                        where: {
                            therapistId: therapist.id,
                        },
                        include: {
                            therapist: true,
                            patient: true,
                        },
                    });
                } catch (error) {
                    console.log(error);
                }
            } else {
                const patient = await ctx.prisma.patient.findUnique({
                    where: { userId: ctx.auth.userId },
                });

                if (!patient) {
                    throw new Error("Patient not found");
                }

                try {
                    return await ctx.prisma.recurrence.findMany({
                        where: {
                            patientId: patient.id,
                        },
                        include: {
                            therapist: true,
                            patient: true,
                        },
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        }),
});
