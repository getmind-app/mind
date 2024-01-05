import { type Address } from "../../../../packages/db";

function getDistanceFromCurrentLocation({
    address,
    currentLocation,
}: {
    address: Address;
    currentLocation: {
        latitude: number;
        longitude: number;
    } | null;
}) {
    if (!currentLocation || !address.latitude || !address.longitude) {
        return null;
    }

    const R = 6371e3; // metres
    const φ1 = (currentLocation.latitude * Math.PI) / 180; // φ, λ in radians
    const φ2 = (address.latitude * Math.PI) / 180;
    const Δφ = ((address.latitude - currentLocation.latitude) * Math.PI) / 180;
    const Δλ =
        ((address.longitude - currentLocation.longitude) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // in metres

    return Math.round(distance);
}

export default getDistanceFromCurrentLocation;
