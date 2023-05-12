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
          role: z.enum(["patient", "professional", "teste"]),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("teste")  
    console.log(input)  
    try {
        const user = await clerk.users.updateUserMetadata(ctx.auth.userId, {
          publicMetadata: { role: input.metadata.role },
        });
        return user;
      } catch (e) {
        console.log(e);
      }
    }),
});
