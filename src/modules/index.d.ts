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

interface IMapType {
    type: MapsPackages
    api_key?: string
}

interface IProps {
    initiallyCoord: L.LatLngTuple
    inputTitle?: string
    placeholder?: string
    lang?: string
    country?: string,
    mapType?: IMapType
    zoom?: number
    getRefInput?: (data: HTMLInputElement) => void
    getMapData?: (data: IData) => void
}

interface ILatLng {
    lat: number
    lng: number
}