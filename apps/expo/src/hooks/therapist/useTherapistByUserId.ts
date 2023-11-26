import { api } from "../../utils/api";
import { useUserIsProfessional } from "../user/useUserIsProfessional";

export function useTherapistByUserId() {
    const userIsProfessional = useUserIsProfessional();

    const therapist = api.therapists.findByUserId.useQuery(undefined, {
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        enabled: userIsProfessional,
    });

    return therapist;
}
