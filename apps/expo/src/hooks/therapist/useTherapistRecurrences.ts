import { api } from "../../utils/api";

export function useTherapistRecurrences() {
    const { data } = api.therapists.recurrences.useQuery();

    return data;
}
