function calculateBoundingBox(
    centerLat: number,
    centerLon: number,
    distance: number,
    buffer = 0.0251,
): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
    const R = 6371; // Radius of the Earth in kilometers
    const latRadian = centerLat * (Math.PI / 180);

    const latDistance = distance / 2;
    const lonDistance = Math.asin(
        Math.sin(latDistance / R) / Math.cos(latRadian),
    );

    const bufferedLatDistance = latDistance + buffer;
    const bufferedLonDistance = lonDistance + buffer;

    const minLat = centerLat - bufferedLatDistance;
    const maxLat = centerLat + bufferedLatDistance;
    const minLon = centerLon - bufferedLonDistance;
    const maxLon = centerLon + bufferedLonDistance;

    return {
        minLat,
        maxLat,
        minLon,
        maxLon,
    };
}

export default calculateBoundingBox;
