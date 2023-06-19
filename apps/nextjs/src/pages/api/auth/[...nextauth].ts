import NextAuth from "next-auth";

import { authOptions } from "@acme/auth";

export const runtime = "nodejs";

export default NextAuth(authOptions);
