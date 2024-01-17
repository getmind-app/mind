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
});
