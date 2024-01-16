import clerkClient from "@clerk/clerk-sdk-node";

export function getUser(userId: string) {
    return clerkClient.users.getUser(userId);
}
