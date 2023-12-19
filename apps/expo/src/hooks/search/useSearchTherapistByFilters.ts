import { type Gender, type Modality } from "../../../../../packages/db";
import { api } from "../../utils/api";

export function useSearchTherapistByFilters({
    name,
    priceRange,
    gender,
    modalities,
    proximity,
    currentLocation,
}: {
    name: string | null;
    priceRange: {
        min: number;
        max: number;
    } | null;
    gender: Gender[] | null;
    modalities: Modality[] | null;
    proximity: number | null;
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
            proximity,
            currentLocation,
        },
        {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        },
    );

    return therapistByNameQuery;
}
