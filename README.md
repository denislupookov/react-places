React-places - this is the npm package you need to find or suggest addresses on the map

#### Features

- Find addresses with drop down suggestions
- Map with functionaluty to scroll, zoom, click
- Show addresses on map
- Use Leaflet or TomTom map

#### Installation

To install the stable version

    npm install --save react-places

with Yarn:

    yarn add react-places

#### Usage

Import package as React Component

    import ReactPlaces from 'react-places'

If you want use our css styles

    import "react-places/dist/index.css";

Finally you will have:

    import ReactPlaces from 'react-places'
    import "react-places/dist/index.css";
    
    function App() {
      return (
          <ReactPlaces
            initiallyCoord={[51.505, -0.09]}
          />
      );
    }
    
    export default App;

## Props 

|  Prop | Type  | Required  | Description |
| ------------ | ------------| :------------: | ------------|
| initiallyCoord  |  array | ✅ | Coordinates for map (lat, lng)
|  inputTitle | string  |   | Title for input
|  placeholder | string  |   | Placeholder for input
|  lang | string  |   | Language of map and search text
|  country | string  |   | Country for search params (will show addresses only from this coutry )
|  zoom | number  |   | Zoom for map )
|  mapType | object (IMapType)  |   | Map Package to use ( Leaflet or TomTom )
|  getRefInput | function (data: HTMLInputElement)  |   | Get Ref of input
|  getMapData | function (data: IData)  |   | Returns selected address from map

## Interface 

    interface IMapTypes {
        type: MapsPackages
        api_key?: string
    }
    
    export enum MapsPackages {
        LEAFLET = 0,
        TOMTOM = 1
    }
