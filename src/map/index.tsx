import React, { useState, useRef, useMemo, useEffect, LegacyRef } from 'react';

import 'leaflet/dist/leaflet.css';

import { MapContainer, TileLayer, Marker, Popup, useMapEvent, useMap } from 'react-leaflet'
import L from 'leaflet';
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet/dist/leaflet.css";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);
L.Map.mergeOptions({
    gestureHandling: true
})

interface IMapClick {
    getMapOnClick: (lat: L.LatLng) => void
}

const MapClick = ({ getMapOnClick }: IMapClick) => {
    const map = useMapEvent('click', (e) => {
        getMapOnClick(e.latlng)
    })
    return null
}

interface IDD extends IData {
    label: string
}

interface IState {
    inputValue: string
    dropDownData: IDD[]
    coord: L.LatLngTuple
    dragging: boolean
    streetName: string
    isClicked: boolean
    inputFocused: boolean
    currentIndex: number
    isLoading: boolean
    map: L.Map | null
    mapData: any
}

interface IDraggableMarker {
    setDataMap: any
    coord: L.LatLngTuple
    dragging: boolean
    setDragging: any
    streetName: string
    getMap: (map: L.Map) => void
}

interface ILatLng {
    lat: number
    lng: number
}

interface IDragMarker extends React.RefObject<L.Marker<any>> {
    getLatLng: () => ILatLng
}

class Map extends React.Component<IProps, IState> {
    private refInput: React.RefObject<HTMLInputElement>;

    constructor(props: IProps) {
        super(props);
        this.state = {
            inputValue: "",
            dropDownData: [],
            coord: this.props.initiallyCoord,
            dragging: false,
            streetName: "",
            isClicked: false,
            inputFocused: false,
            currentIndex: -1,
            isLoading: false,
            map: null,
            mapData: {}
        }
        this.refInput = React.createRef();
    }

    findPlace = (e: React.ChangeEvent<HTMLInputElement>) => {
        document.addEventListener('click', (e) => this.handleOutsideClick(e), false);

        const { lang, country } = this.props
        const { value } = e.target
        this.setState({
            inputValue: value
        })
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&street=${value}${country ? `&country=${country}` : ""}`
        const req = {
            method: 'POST',
            headers: {
                'accept-language': lang || "en"
            },
        }
        fetch(url, req)
            .then(response => response.json())
            .then(data => {
                let res: IDD[] = data.map((item: IData) => {
                    const { address } = item
                    const street = `${address?.road || ""} ${address?.house_number || ""}`
                    let resultName: string[] = []

                    resultName.push(
                        address?.country,
                        address?.city,
                        address?.district,
                        address?.village || (street.trim())
                    )

                    resultName = resultName.filter(el => el)
                    const resName = resultName.length > 1 ? resultName.join(", ") : resultName[0]

                    return {
                        ...item,
                        label: resName,
                        coord: [item.lat, item.lon],
                    }
                })

                const uniqueArr: string[] = []

                const unique = res.filter((element) => {
                    const isDuplicate = uniqueArr.includes(element.label);

                    if (!isDuplicate) {
                        uniqueArr.push(element.label);

                        return true;
                    }

                    return false;
                });

                this.setState({
                    dropDownData: unique
                })
            })
    }

    getOpenStreetName = (data: any) => {
        let houseNumber = "";
        let roadName = "";
        let cityName = "";

        if (data.address.house_number !== undefined) {
            houseNumber = data.address.house_number;
        }
        if (data.address.road !== undefined) {
            roadName = data.address.road + (data.address.house_number !== undefined ? ", " : "")
        }
        if (data.address.city !== undefined) {
            cityName = data.address.city + ", "
        }

        const fillTitle = cityName + roadName + houseNumber;
        return fillTitle === "" ? data.display_name : fillTitle;
    }

    fitZoom = (type: string) => {
        if (type === "building") {
            return 18;
        }
        if (type === "highway") {
            return 16;
        }
        else {
            return 13;
        }
    }

    getMapData = (data: any) => {
        if (data.label === undefined) {
            data.label = this.state.inputValue
        }
        if (this.props.getMapData) {
            this.props.getMapData(data)
        }
    }

    setDragging = (bool: boolean) => {
        this.setState({
            dragging: bool
        })
    }

    setStreetName = (name: string) => {
        this.setState({
            inputValue: name
        })
    }

    setDataMap = (data: IData) => {
        if (data.error !== "Unable to geocode") {
            this.setState({
                mapData: data,
                inputValue: this.getOpenStreetName(data)
            })
            this.getMapData(data);
            this.setDragging(false)
            this.setStreetName(data.display_name)
        }
    }

    selectPlace = async (data: IDD) => {
        const { map } = this.state
        const { lat, lon, label, type } = data
        const coord: L.LatLngTuple = [lat, lon]
        this.setState({
            isClicked: false,
            isLoading: true,
            coord: coord
        })

        map && map.flyTo(coord, this.fitZoom(type))

        this.setDragging(false)
        this.setStreetName(label)
        this.getMapData(data);
    }

    getCoord = async (data: ILatLng) => {
        const { lat, lng } = data
        this.setState({
            coord: [lat, lng]
        })

        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

        const response = await fetch(url)
        const dataJson = await response.json();
        this.setDataMap(dataJson)
    }

    focusInput = () => {
        this.setState({
            inputFocused: true
        })
    }

    handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.keyCode === 38 && this.state.currentIndex > 0) {
            this.setState(prevState => ({
                currentIndex: prevState.currentIndex - 1
            }))
        }
        else if (e.keyCode === 40 && this.state.currentIndex < this.state.dropDownData.length - 1) {
            this.setState(prevState => ({
                currentIndex: prevState.currentIndex + 1
            }))
        }
        if (this.state.currentIndex !== -1) {
            if (e.keyCode === 13) {
                const currentElement = this.state.dropDownData[this.state.currentIndex];
                this.selectPlace(currentElement)
                this.setState({
                    dropDownData: [],
                    currentIndex: -1
                })
            }
        }
    }

    removeDropDown = (e: React.FocusEvent<HTMLInputElement>) => {
        if (!e.target.closest(".input_drop_down_block")) {
            this.setState({
                dropDownData: []
            })
        }
        this.setState({
            inputFocused: false
        })
    }

    setMap = (mapEl: L.Map) => {
        const { map, coord } = this.state;

        if (!map) {
            const coordLatLng: ILatLng = {
                lat: coord[0],
                lng: coord[1]
            }
            this.getCoord(coordLatLng)
            this.setState({
                map: mapEl
            })
        }
    }

    getRef = (ref: HTMLInputElement) => {
        const { getRefInput } = this.props

        if (getRefInput && ref) {
            getRefInput(ref);
        }
    }

    handleOutsideClick = (e: MouseEvent) => {
        const target = e.target as HTMLDivElement;

        if (target) {
            if (target.closest(".input_drop_down_block")) {
                this.setState({
                    dropDownData: []
                })
            }
        }
    }

    render() {
        const { inputTitle, placeholder } = this.props
        const { dropDownData, inputFocused, inputValue, 
            isLoading, currentIndex, coord, dragging } = this.state

        return (
            <div>
                <div style={{ marginTop: 15 }}>
                    <div className="input_drop_down_block">
                        <div className="search_input input_drop_block" style={{ width: "100%" }}>
                            {inputTitle !== undefined ? (
                                <span className="search_title">{inputTitle}</span>
                            ) : ""}
                            <div className={"search" + (inputFocused ? " search_focused" : "")}>
                                <input type="text" placeholder={placeholder}
                                    className={(dropDownData.length !== 0 ? "active_drop_down_input " : "")}
                                    value={inputValue}
                                    ref={(ref) => {
                                        if (ref) {
                                            this.getRef(ref)
                                        }
                                    }}
                                    onChange={this.findPlace}
                                    onBlur={(e) => this.removeDropDown(e)}
                                    onFocus={this.focusInput}
                                    onKeyDown={this.handleKeyDown}
                                />
                                {isLoading ? (
                                    <div className="input_loader">
                                        <div className="loading black"></div>
                                    </div>
                                ) : ""}
                            </div>
                        </div>

                        {dropDownData.length !== 0 ? (
                            <div className="drop_down_container">
                                {dropDownData.map((item, index) => {
                                    return (
                                        <div
                                            className={(currentIndex === index ? "active_index_drop_down " : "") + "drop_down_block_select"}
                                            key={index}
                                            onClick={() => this.selectPlace(item)}
                                        >
                                            <span>{item.label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : ""}
                    </div>
                </div>

                <div className="map_container">

                    <MapContainer
                        center={coord}
                        zoom={13}
                        scrollWheelZoom={false}
                        className="map"
                    >
                        <MapClick
                            getMapOnClick={this.getCoord}
                        />
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <DraggableMarker
                            setDataMap={(data: IData) => this.setDataMap(data)}
                            coord={coord}
                            dragging={dragging}
                            setDragging={(bool: boolean) => this.setDragging(bool)}
                            streetName={inputValue}
                            getMap={map => this.setMap(map)}
                        />
                    </MapContainer>
                </div>
            </div>
        )
    }
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
                    }

                    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
                    const response = await fetch(url)
                    const dataJson = await response.json();
                    setDataMap(dataJson)
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

export default (Map);