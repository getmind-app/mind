import { type Gender, type Modality } from "../../../../../packages/db";
import { api } from "../../utils/api";

export function useSearchTherapistByFilters({
    name,
    priceRange,
    gender,
    modalities,
    distance,
    currentLocation,
}: {
    name: string | null;
    priceRange: {
        min: number;
        max: number;
    } | null;
    gender: Gender[] | null;
    modalities: Modality[] | null;
    distance: number | null;
    currentLocation: {
        latitude: number;
        longitude: number;
    } | null;
}) {
    const therapistByNameQuery = api.therapists.findWithFilters.useQuery(
        {
            name,
            priceRange,
            gender,
            modalities,
            distance,
            currentLocation,
        },
        {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        },
    );

    return therapistByNameQuery;
}
