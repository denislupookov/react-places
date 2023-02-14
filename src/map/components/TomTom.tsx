import '@tomtom-international/web-sdk-maps/dist/maps.css'
import { useRef, useState, useEffect } from 'react';
import tt, { LngLatLike, Map } from '@tomtom-international/web-sdk-maps';
import { getCoordsData } from '../services/MapService'

interface IPropsTomTom {
    language: string
    coord: number[]
    map?: tt.Map
    api_key: string
    zoom?: number
    setMap: (mapEl: tt.Map) => void
    setDataMap: (data: IData) => void
    getCoord: (data: ILatLng) => void
}

const TomTom: React.FC<IPropsTomTom> = ({ language, coord, map, api_key, zoom, setMap, setDataMap, getCoord }) => {
    const mapElement = useRef() as React.MutableRefObject<HTMLDivElement>;;

    useEffect(() => {
        const center = [coord[1], coord[0]] as tt.LngLatLike;
        let map = tt.map({
            key: api_key,
            container: mapElement.current || "",
            zoom: zoom || 13,
            language,
            center,
        });
        setMap(map);

        return () => map.remove();
    }, []);

    const clickMap = async (e: any, marker: tt.Marker) => {
        const { lngLat: { lat, lng }, lngLat } = e

        marker.setLngLat([lng, lat])
        getCoord(lngLat)
    }

    const onDragEnd = async (marker: tt.Marker) => {
        const lngLat = marker.getLngLat();
        const { lng, lat } = lngLat

        const dataJson = await getCoordsData(lat, lng);
        setDataMap(dataJson)
    }

    useEffect(() => {
        if (map) {
            const center = [coord[1], coord[0]] as tt.LngLatLike;

            const marker = new tt.Marker({
                draggable: true
            }).setLngLat(center).addTo(map);

            map.on('click', e => clickMap(e, marker))
            marker.on('dragend', e => onDragEnd(marker));
        }
    }, [coord])

    return (
        <div className="map_container">
            <div ref={mapElement} className="map"></div>
        </div>
    )
}

export default TomTom;