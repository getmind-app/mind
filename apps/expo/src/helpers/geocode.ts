import * as Location from "expo-location";

import { type Address } from ".prisma/client";

export const geocode = async (address: Address) => {
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
