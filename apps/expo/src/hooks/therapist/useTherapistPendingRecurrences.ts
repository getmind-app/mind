import { api } from "../../utils/api";

export function useTherapistPendingRecurrences() {
    const { data } = api.therapists.pendentRecurrences.useQuery();

    return data;
}
