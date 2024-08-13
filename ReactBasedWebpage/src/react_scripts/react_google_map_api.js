// react_google_map_api.js
// Loads the Google Map onto the webpage.
//
// Coder: Jan Baraniecki
// Modified by: Larry Huang

import React from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import Routing from './gpx_routing';


const ReactGoogleMapAPI = ({gpxData, gpxCategory, setMarkers=(data)=>{console.log(data);}}) => {
  //Handles the API key from the web server's environment
  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLEMAPS_KEY}>
      <Map
        id="reactGoogleMap"
        mapId={process.env.REACT_APP_GOOGLEMAPS_MAPID}
        defaultCenter={{lat: 35.1988, lng: -111.652}}
        defaultZoom={17}
      >
      </Map>
      <Routing
        gpxData={gpxData}
        gpxCategory={gpxCategory}
        markerOutputCall={setMarkers}
      />
    </APIProvider>
  );
}

export default ReactGoogleMapAPI;