import * as Location from "expo-location";

import { type Address } from ".prisma/client";

const geocodeAddress = async (address: Address | null | undefined) => {
    if (!address) {
        return;
    }

    void Location.getProviderStatusAsync().then(async (status) => {
        if (!status.locationServicesEnabled) {
            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                return;
            }
        }
    });

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

    return `https://www.google.com/maps/search/?api=1&query=${location[0]?.latitude},${location[0]?.longitude}`;
};

export default geocodeAddress;
