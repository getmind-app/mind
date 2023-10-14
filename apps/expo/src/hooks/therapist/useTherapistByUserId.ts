import { api } from "../utils/api";

export function useTherapistByUserId() {
    const therapist = api.therapists.findByUserId.useQuery(undefined, {
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    return therapist;
}
