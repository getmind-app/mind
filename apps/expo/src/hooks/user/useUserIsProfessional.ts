import { useClerk } from "@clerk/clerk-expo";

export function useUserIsProfessional() {
    const { user } = useClerk();

    return user?.publicMetadata?.role === "professional";
}
