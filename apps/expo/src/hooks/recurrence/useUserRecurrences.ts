import { api } from "../../utils/api";
import { useUserIsProfessional } from "../user/useUserIsProfessional";

export function useUserRecurrences() {
    const isTherapist = useUserIsProfessional();
    const recurrences = api.recurrences.allUserRecurrences.useQuery({
        userRole: isTherapist ? "professional" : "patient",
    });
    return recurrences;
}
