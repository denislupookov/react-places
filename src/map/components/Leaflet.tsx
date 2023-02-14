import React, { useState, useRef, useMemo, useEffect, LegacyRef } from 'react';

import { MapContainer, TileLayer, Marker, Popup, useMapEvent, useMap } from 'react-leaflet'
import { getCoordsData } from '../services/MapService'

interface IPropsLeaflet {
    coord: L.LatLngTuple
    dragging: boolean
    inputValue: string
    zoom?: number
    getCoord: (data: ILatLng) => void
    setDataMap: (data: IData) => void
    setDragging: (bool: boolean) => void
    setMap: (mapEl: L.Map) => void
}

interface IDraggableMarker {
    setDataMap: any
    coord: L.LatLngTuple
    dragging: boolean
    setDragging: any
    streetName: string
    getMap: (map: L.Map) => void
}

interface IDragMarker extends React.RefObject<L.Marker<any>> {
    getLatLng: () => ILatLng
}

interface IMapClick {
    getMapOnClick: (lat: L.LatLng) => void
}

const MapClick = ({ getMapOnClick }: IMapClick) => {
    const map = useMapEvent('click', (e) => {
        getMapOnClick(e.latlng)
    })
    return null
}

const Leaflet: React.FC<IPropsLeaflet> = ({ coord, dragging, inputValue, zoom, getCoord, ...props }) => {

    const setDataMap = (data: IData) => {
        if (data.error !== "Unable to geocode") {
            props.setDataMap(data)
        }
    }

    return (
        <MapContainer
            center={coord}
            zoom={zoom || 13}
            scrollWheelZoom={false}
            className="map"
        >
            <MapClick
                getMapOnClick={getCoord}
            />
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DraggableMarker
                setDataMap={(data: IData) => setDataMap(data)}
                coord={coord}
                dragging={dragging}
                setDragging={props.setDragging}
                streetName={inputValue}
                getMap={props.setMap}
            />
        </MapContainer>
    )
}

const DraggableMarker: React.FC<IDraggableMarker> = ({ setDataMap, coord, dragging, setDragging, streetName, getMap }) => {
    const [position, setPosition] = useState(coord)
    const markerRef = useRef<IDragMarker>(null)
    const map = useMap()

    useEffect(() => {
        if (!dragging) {
            setPosition(coord);
        }
    });

    useEffect(() => {
        if (getMap) {
            getMap(map)
        }
    }, [getMap])

    const eventHandlers = useMemo(
        () => ({
            async dragend() {
                setDragging(true)
                if (markerRef) {
                    const marker = markerRef.current
                    let lat, lng;
                    if (marker !== null) {
                        lat = marker.getLatLng().lat;
                        lng = marker.getLatLng().lng;

                        const dataJson = await getCoordsData(lat, lng)
                        setDataMap(dataJson)
                    }
                }
            },
        }),
        [],
    )

    return (
        <Marker
            draggable
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef as IDragMarker}>
            <Popup minWidth={90}>
                <span>
                    {streetName}
                </span>
            </Popup>
        </Marker>
    )
}

export default Leaflet;