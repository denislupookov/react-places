interface IData {
    address: {
        road: string
        house_number: number
        country: string
        city: string
        district: string
        village: string
    }
    boundingbox: string[]
    display_name: string
    lat: number
    lon: number
    type: string
    error: string
}

interface IProps {
    initiallyCoord: L.LatLngTuple
    inputTitle?: string
    placeholder?: string
    lang?: string
    country?: string,
    getRefInput?: (data: HTMLInputElement) => void
    getMapData?: (data: IData) => void
}