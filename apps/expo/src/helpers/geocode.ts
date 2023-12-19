import * as Location from "expo-location";

type GeocodeInput = {
    street: string;
    number: string;
    city: string;
    state: string;
    country: string;
};

export const geocode = async (address: GeocodeInput) => {
    const location = await Location.geocodeAsync(
        address?.street +
            ", " +
            address?.number +
            ", " +
            address?.city +
            ", " +
            address?.state +
            ", " +
            address?.country,
    );

    return location;
};
