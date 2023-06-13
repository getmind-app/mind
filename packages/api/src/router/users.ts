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
          role: z.enum(["patient", "professional"]),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.time("updateUserMetadata");

      try {
        const user = await clerk.users.updateUserMetadata(ctx.auth.userId, {
          publicMetadata: input.metadata,
        });
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
  clearMetadata: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      console.log("clearMetadata");
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
  getAllProfessionals: protectedProcedure.query(async () => {
    const users = await clerk.users.getUserList();
    const professionals = users.filter(
      (user) => user.publicMetadata?.role === "professional",
    );
    return professionals;
  }),
  getProfessional: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const professionalData = await clerk.users.getUser(input.id);

      // TODO: this is where we would query the database for the professional's appointments
      const weeklyAppointments = 12;

      // TODO: maybe this should be on our side
      const professionalMetadataSchema = z.object({
        crp: z.string(),
        about: z.string(),
        methodologies: z.array(z.string()),
        education: z.array(
          z.object({
            institution: z.string(),
            course: z.string(),
          }),
        ),
        hourlyRate: z.number(),
        yearsOfExperience: z.number(),
      });

      return {
        ...professionalData,
        publicMetadata: {
          ...professionalMetadataSchema.parse(professionalData.publicMetadata),
          weeklyAppointments,
        },
      };
    }),
});
