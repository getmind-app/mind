import NextAuth from "next-auth";

import { authOptions } from "@acme/auth";

export const runtime = "edge";

export default NextAuth(authOptions);
