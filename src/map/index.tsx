import React from 'react';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet/dist/leaflet.css";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import LeafletMap from './components/Leaflet'
import TomTomMap from './components/TomTom'
import tt from '@tomtom-international/web-sdk-maps';
import { getCoordsData } from './services/MapService'
import { MapsPackages } from '../modules/enums'

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);
L.Map.mergeOptions({
    gestureHandling: true
})

interface IDD extends IData {
    label: string
}

interface IMap {
    type: MapsPackages
    map: L.Map | tt.Map | null
}

interface IState {
    inputValue: string
    dropDownData: IDD[]
    coord: L.LatLngTuple
    dragging: boolean
    streetName: string
    inputFocused: boolean
    currentIndex: number
    isLoading: boolean
    map: IMap | null
    mapData: any
}

class Map extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            inputValue: "",
            dropDownData: [],
            coord: this.props.initiallyCoord,
            dragging: false,
            streetName: "",
            inputFocused: false,
            currentIndex: -1,
            isLoading: false,
            map: null,
            mapData: {}
        }
    }

    findPlace = (e: React.ChangeEvent<HTMLInputElement>) => {
        document.addEventListener('click', (e) => this.handleOutsideClick(e), false);

        const { lang, country } = this.props
        const { value } = e.target
        this.setState({
            inputValue: value,
            isLoading: true
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
                    dropDownData: unique,
                    isLoading: false
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
            coord: coord
        })

        if (map && map.map) {
            if (map.type === MapsPackages.LEAFLET) {
                let mapEl = map.map as L.Map
                mapEl.flyTo(coord, this.fitZoom(type))
            }
            else {
                let mapEl = map.map as tt.Map
                mapEl.jumpTo({
                    center: [coord[1], coord[0]]
                })
            }
        }

        this.setDragging(false)
        this.setStreetName(label)
        this.getMapData(data);
    }

    getCoord = async (data: ILatLng) => {
        const { lat, lng } = data
        this.setState({
            coord: [lat, lng]
        })

        const dataJson = await getCoordsData(lat, lng)
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

    setLeafletMap = (map: L.Map) => {
        this.setMap(MapsPackages.LEAFLET, map)
    }

    setTTMap = (map: tt.Map) => {
        this.setMap(MapsPackages.TOMTOM, map)
    }

    setMap = (type: MapsPackages, mapEl: L.Map | tt.Map) => {
        const { map, coord } = this.state;

        if (!map) {
            const coordLatLng: ILatLng = {
                lat: coord[0],
                lng: coord[1]
            }
            this.getCoord(coordLatLng)
            this.setState({
                map: {
                    type,
                    map: mapEl
                }
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
        const { inputTitle, placeholder, lang, mapType, zoom } = this.props
        const { dropDownData, inputFocused, inputValue,
            isLoading, currentIndex, coord, map, dragging } = this.state

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

                    {!mapType || mapType.type === MapsPackages.LEAFLET ? (
                        <LeafletMap
                            getCoord={this.getCoord}
                            setDataMap={this.setDataMap}
                            setDragging={this.setDragging}
                            setMap={this.setLeafletMap}
                            {...{ coord, dragging, inputValue, zoom }}
                        />
                    ) : null}

                    {mapType && mapType.type === MapsPackages.TOMTOM ? (
                        <TomTomMap
                            language={lang || "en"}
                            setMap={this.setTTMap}
                            setDataMap={this.setDataMap}
                            getCoord={this.getCoord}
                            map={map?.map as tt.Map}
                            api_key={mapType.api_key || ""}
                            {...{ coord, zoom }}
                        />
                    ) : null}
                </div>
            </div>
        )
    }
}



export default (Map);