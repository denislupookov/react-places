var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet/dist/leaflet.css";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import LeafletMap from './components/Leaflet';
import TomTomMap from './components/TomTom';
import { getCoordsData } from './services/MapService';
import { MapsPackages } from '../modules/enums';
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});
L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);
L.Map.mergeOptions({
    gestureHandling: true
});
var Map = /** @class */ (function (_super) {
    __extends(Map, _super);
    function Map(props) {
        var _this = _super.call(this, props) || this;
        _this.findPlace = function (e) {
            document.addEventListener('click', function (e) { return _this.handleOutsideClick(e); }, false);
            var _a = _this.props, lang = _a.lang, country = _a.country;
            var value = e.target.value;
            _this.setState({
                inputValue: value,
                isLoading: true
            });
            var url = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&street=".concat(value).concat(country ? "&country=".concat(country) : "");
            var req = {
                method: 'POST',
                headers: {
                    'accept-language': lang || "en"
                },
            };
            fetch(url, req)
                .then(function (response) { return response.json(); })
                .then(function (data) {
                var res = data.map(function (item) {
                    var address = item.address;
                    var street = "".concat((address === null || address === void 0 ? void 0 : address.road) || "", " ").concat((address === null || address === void 0 ? void 0 : address.house_number) || "");
                    var resultName = [];
                    resultName.push(address === null || address === void 0 ? void 0 : address.country, address === null || address === void 0 ? void 0 : address.city, address === null || address === void 0 ? void 0 : address.district, (address === null || address === void 0 ? void 0 : address.village) || (street.trim()));
                    resultName = resultName.filter(function (el) { return el; });
                    var resName = resultName.length > 1 ? resultName.join(", ") : resultName[0];
                    return __assign(__assign({}, item), { label: resName, coord: [item.lat, item.lon] });
                });
                var uniqueArr = [];
                var unique = res.filter(function (element) {
                    var isDuplicate = uniqueArr.includes(element.label);
                    if (!isDuplicate) {
                        uniqueArr.push(element.label);
                        return true;
                    }
                    return false;
                });
                _this.setState({
                    dropDownData: unique,
                    isLoading: false
                });
            });
        };
        _this.getOpenStreetName = function (data) {
            var houseNumber = "";
            var roadName = "";
            var cityName = "";
            if (data.address.house_number !== undefined) {
                houseNumber = data.address.house_number;
            }
            if (data.address.road !== undefined) {
                roadName = data.address.road + (data.address.house_number !== undefined ? ", " : "");
            }
            if (data.address.city !== undefined) {
                cityName = data.address.city + ", ";
            }
            var fillTitle = cityName + roadName + houseNumber;
            return fillTitle === "" ? data.display_name : fillTitle;
        };
        _this.fitZoom = function (type) {
            if (type === "building") {
                return 18;
            }
            if (type === "highway") {
                return 16;
            }
            else {
                return 13;
            }
        };
        _this.getMapData = function (data) {
            if (data.label === undefined) {
                data.label = _this.state.inputValue;
            }
            if (_this.props.getMapData) {
                _this.props.getMapData(data);
            }
        };
        _this.setDragging = function (bool) {
            _this.setState({
                dragging: bool
            });
        };
        _this.setStreetName = function (name) {
            _this.setState({
                inputValue: name
            });
        };
        _this.setDataMap = function (data) {
            if (data.error !== "Unable to geocode") {
                _this.setState({
                    mapData: data,
                    inputValue: _this.getOpenStreetName(data)
                });
                _this.getMapData(data);
                _this.setDragging(false);
                _this.setStreetName(data.display_name);
            }
        };
        _this.selectPlace = function (data) { return __awaiter(_this, void 0, void 0, function () {
            var map, lat, lon, label, type, coord, mapEl, mapEl;
            return __generator(this, function (_a) {
                map = this.state.map;
                lat = data.lat, lon = data.lon, label = data.label, type = data.type;
                coord = [lat, lon];
                this.setState({
                    coord: coord
                });
                if (map && map.map) {
                    if (map.type === MapsPackages.LEAFLET) {
                        mapEl = map.map;
                        mapEl.flyTo(coord, this.fitZoom(type));
                    }
                    else {
                        mapEl = map.map;
                        mapEl.jumpTo({
                            center: [coord[1], coord[0]]
                        });
                    }
                }
                this.setDragging(false);
                this.setStreetName(label);
                this.getMapData(data);
                return [2 /*return*/];
            });
        }); };
        _this.getCoord = function (data) { return __awaiter(_this, void 0, void 0, function () {
            var lat, lng, dataJson;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lat = data.lat, lng = data.lng;
                        this.setState({
                            coord: [lat, lng]
                        });
                        return [4 /*yield*/, getCoordsData(lat, lng)];
                    case 1:
                        dataJson = _a.sent();
                        this.setDataMap(dataJson);
                        return [2 /*return*/];
                }
            });
        }); };
        _this.focusInput = function () {
            _this.setState({
                inputFocused: true
            });
        };
        _this.handleKeyDown = function (e) {
            if (e.keyCode === 38 && _this.state.currentIndex > 0) {
                _this.setState(function (prevState) { return ({
                    currentIndex: prevState.currentIndex - 1
                }); });
            }
            else if (e.keyCode === 40 && _this.state.currentIndex < _this.state.dropDownData.length - 1) {
                _this.setState(function (prevState) { return ({
                    currentIndex: prevState.currentIndex + 1
                }); });
            }
            if (_this.state.currentIndex !== -1) {
                if (e.keyCode === 13) {
                    var currentElement = _this.state.dropDownData[_this.state.currentIndex];
                    _this.selectPlace(currentElement);
                    _this.setState({
                        dropDownData: [],
                        currentIndex: -1
                    });
                }
            }
        };
        _this.removeDropDown = function (e) {
            if (!e.target.closest(".input_drop_down_block")) {
                _this.setState({
                    dropDownData: []
                });
            }
            _this.setState({
                inputFocused: false
            });
        };
        _this.setLeafletMap = function (map) {
            _this.setMap(MapsPackages.LEAFLET, map);
        };
        _this.setTTMap = function (map) {
            _this.setMap(MapsPackages.TOMTOM, map);
        };
        _this.setMap = function (type, mapEl) {
            var _a = _this.state, map = _a.map, coord = _a.coord;
            if (!map) {
                var coordLatLng = {
                    lat: coord[0],
                    lng: coord[1]
                };
                _this.getCoord(coordLatLng);
                _this.setState({
                    map: {
                        type: type,
                        map: mapEl
                    }
                });
            }
        };
        _this.getRef = function (ref) {
            var getRefInput = _this.props.getRefInput;
            if (getRefInput && ref) {
                getRefInput(ref);
            }
        };
        _this.handleOutsideClick = function (e) {
            var target = e.target;
            if (target) {
                if (target.closest(".input_drop_down_block")) {
                    _this.setState({
                        dropDownData: []
                    });
                }
            }
        };
        _this.state = {
            inputValue: "",
            dropDownData: [],
            coord: _this.props.initiallyCoord,
            dragging: false,
            streetName: "",
            inputFocused: false,
            currentIndex: -1,
            isLoading: false,
            map: null,
            mapData: {}
        };
        return _this;
    }
    Map.prototype.render = function () {
        var _this = this;
        var _a = this.props, inputTitle = _a.inputTitle, placeholder = _a.placeholder, lang = _a.lang, mapType = _a.mapType, zoom = _a.zoom;
        var _b = this.state, dropDownData = _b.dropDownData, inputFocused = _b.inputFocused, inputValue = _b.inputValue, isLoading = _b.isLoading, currentIndex = _b.currentIndex, coord = _b.coord, map = _b.map, dragging = _b.dragging;
        return (_jsxs("div", { children: [_jsx("div", __assign({ style: { marginTop: 15 } }, { children: _jsxs("div", __assign({ className: "input_drop_down_block" }, { children: [_jsxs("div", __assign({ className: "search_input input_drop_block", style: { width: "100%" } }, { children: [inputTitle !== undefined ? (_jsx("span", __assign({ className: "search_title" }, { children: inputTitle }))) : "", _jsxs("div", __assign({ className: "search" + (inputFocused ? " search_focused" : "") }, { children: [_jsx("input", { type: "text", placeholder: placeholder, className: (dropDownData.length !== 0 ? "active_drop_down_input " : ""), value: inputValue, ref: function (ref) {
                                                    if (ref) {
                                                        _this.getRef(ref);
                                                    }
                                                }, onChange: this.findPlace, onBlur: function (e) { return _this.removeDropDown(e); }, onFocus: this.focusInput, onKeyDown: this.handleKeyDown }), isLoading ? (_jsx("div", __assign({ className: "input_loader" }, { children: _jsx("div", { className: "loading black" }) }))) : ""] }))] })), dropDownData.length !== 0 ? (_jsx("div", __assign({ className: "drop_down_container" }, { children: dropDownData.map(function (item, index) {
                                    return (_jsx("div", __assign({ className: (currentIndex === index ? "active_index_drop_down " : "") + "drop_down_block_select", onClick: function () { return _this.selectPlace(item); } }, { children: _jsx("span", { children: item.label }) }), index));
                                }) }))) : ""] })) })), _jsxs("div", __assign({ className: "map_container" }, { children: [!mapType || mapType.type === MapsPackages.LEAFLET ? (_jsx(LeafletMap, __assign({ getCoord: this.getCoord, setDataMap: this.setDataMap, setDragging: this.setDragging, setMap: this.setLeafletMap }, { coord: coord, dragging: dragging, inputValue: inputValue, zoom: zoom }))) : null, mapType && mapType.type === MapsPackages.TOMTOM ? (_jsx(TomTomMap, __assign({ language: lang || "en", setMap: this.setTTMap, setDataMap: this.setDataMap, getCoord: this.getCoord, map: map === null || map === void 0 ? void 0 : map.map, api_key: mapType.api_key || "" }, { coord: coord, zoom: zoom }))) : null] }))] }));
    };
    return Map;
}(React.Component));
export default (Map);
