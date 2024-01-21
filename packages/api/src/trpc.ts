/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */

import type {
    SignedInAuthObject,
    SignedOutAuthObject,
} from "@clerk/nextjs/api";
import { getAuth } from "@clerk/nextjs/server";
import { TRPCError, initTRPC, type inferAsyncReturnType } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";

import { prisma } from "@acme/db";

//https://github.com/clerkinc/t3-turbo-and-clerk/blob/main/packages/api/src
/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API
 *
 * These allow you to access things like the database, the session, etc, when
 * processing a request
 *
 */
type AuthContextProps = {
    auth: SignedInAuthObject | SignedOutAuthObject;
};

export type TrpcContext = inferAsyncReturnType<typeof createContext>;

export const createContextInner = async ({ auth }: AuthContextProps) => {
    return {
        auth,
        prisma,
    };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (opts: CreateNextContextOptions) => {
    return await createContextInner({ auth: getAuth(opts.req) });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC
    .context<inferAsyncReturnType<typeof createContext>>()
    .create({
        transformer: superjson,
        errorFormatter(opts) {
            const { shape, error } = opts;

            return {
                ...shape,
                data: {
                    ...shape.data,
                    zodError:
                        error.code === "BAD_REQUEST" &&
                        error.cause instanceof ZodError
                            ? error.cause.flatten()
                            : null,
                },
            };
        },
    });

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure;

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure
 */
const isAuthed = t.middleware(({ next, ctx }) => {
    if (!ctx.auth.userId) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
        });
    }
    return next({
        ctx: {
            auth: ctx.auth,
        },
    });
});

/**
 * Protected (authed) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees ctx.session.user is not
 * null
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(isAuthed);
