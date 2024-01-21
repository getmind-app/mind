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
            try {
                return await ctx.prisma.recurrence.findMany({
                    where: {
                        ...(input.userRole === "professional"
                            ? { therapistId: ctx.auth.user?.id }
                            : { patientId: ctx.auth.user?.id }),
                    },
                    include: {
                        therapist: true,
                        patient: true,
                    },
                });
            } catch (error) {
                console.log(error);
            }
        }),
});
