import { api } from "../../utils/api";

export function useSearchTherapistByName({ name }: { name: string }) {
    const therapistByNameQuery = api.therapists.findByNameLike.useQuery(
        {
            name,
        },
        {
            enabled: name.length > 2,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        },
    );

    return therapistByNameQuery;
}
