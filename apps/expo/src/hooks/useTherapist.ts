import { api } from "../utils/api";

export function useLoggedTherapist() {
    const therapist = api.therapists.findByUserId.useQuery(undefined, {
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    return therapist;
}
