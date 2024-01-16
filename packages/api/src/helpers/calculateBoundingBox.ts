function calculateBoundingBox(
    centerLat: number,
    centerLon: number,
    distance: number,
): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
    const R = 6371; // Radius of the Earth in kilometers
    const latRadian = centerLat * (Math.PI / 180);

    const latDistance = distance / 2;
    const lonDistance = Math.asin(
        Math.sin(latDistance / R) / Math.cos(latRadian),
    );

    const minLat = centerLat - latDistance;
    const maxLat = centerLat + latDistance;
    const minLon = centerLon - lonDistance;
    const maxLon = centerLon + lonDistance;

    return {
        minLat,
        maxLat,
        minLon,
        maxLon,
    };
}

export default calculateBoundingBox;
