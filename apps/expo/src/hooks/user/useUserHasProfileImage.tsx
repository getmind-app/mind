import { useClerk } from "@clerk/clerk-expo";

import { api } from "../../utils/api";

export function useUserHasProfileImage({ userId }: { userId: string | null }) {
    const { user } = useClerk();

    const userHasImage = api.users.userHasProfileImage.useQuery(
        {
            userId: userId ?? String(user?.id),
        },
        {
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
        },
    );

    return userHasImage;
}
