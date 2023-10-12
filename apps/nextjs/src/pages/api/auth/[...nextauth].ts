import NextAuth, { type AuthOptions } from "next-auth";

import { authOptions } from "@acme/auth";

export default NextAuth(authOptions as AuthOptions);
