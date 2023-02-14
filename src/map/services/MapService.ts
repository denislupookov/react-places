export const getCoordsData = async (lat: number, lng: number) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const response = await fetch(url)
    const dataJson = await response.json();

    return dataJson
}