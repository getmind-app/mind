import { useClerk } from "@clerk/clerk-expo";

import { api } from "../../utils/api";

export function useUserHasProfileImage() {
    const { user } = useClerk();
    const userHasImage = api.users.userHasProfileImage.useQuery(
        {
            userId: String(user?.id),
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
