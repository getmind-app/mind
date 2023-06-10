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
});
