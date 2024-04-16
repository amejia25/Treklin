//
//
//

import React, { useEffect, useState } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';

export const Routing = ({ gpxData, gpxCategory, markerOutputCall=()=>{}}) => {  
  //Routes and tracks will rendered using different methods
    // A: routes will use the directionsService to display a bike-usable path
    // B: tracks can use their existing coordinate data due to the higher number of points and real-point data

  //core contents (code that runs to plot route)
  const map = useMap("reactGoogleMap");
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState();//<google.maps.DirectionsService>
  const [directionsRenderer, setDirectionsRenderer] = useState();//<google.maps.DirectionsRenderer>
  const [routes, setRoutes] = useState([]);//<google.maps.DirectionsRoute[]>
  const [routeIndex, setRouteIndex] = useState(0);
  const [pointList, setPointList] = useState([]);//passed to route renderer
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  //modify point list to an appropriate setting when the data passed to the router
  useEffect(() => {
    var newPointList = [];
    //generate points from gpxData obj passed in [TODO figure out how to select route in multi-route gpx]
    if (gpxData.gpxData) { //&& gpxData.gpxData.routes[0].points
      //console.log(gpxData.gpxData.routes[0].points);
      for (var i = 0; i < gpxData.gpxData.routes[0].points.length; i = i + 1) {
        newPointList.push(gpxData.gpxData.routes[0].points[i].LatLng);
      }
    }
    //TODO make decsion based upon gpxCategory to render or not render
    if (gpxCategory === "ROUTE") {} else if (gpxCategory === "TRACK") {} else if (gpxCategory === "WAYPT") {} else {}
    
    setPointList(newPointList);
    markerOutputCall(newPointList);
  }, [gpxData, markerOutputCall, gpxCategory]);

  //target the current map object and add a route service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    let newRenderer = new routesLibrary.DirectionsRenderer({map});
    newRenderer.setOptions({suppressMarkers: true});
    setDirectionsRenderer(newRenderer);
  }, [routesLibrary, map]);
  
  // on changes to the routing and/or rendering service objects, if both are present, acquire routing data from API (and return render-clearing cleanup)
  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;
    
    console.log(pointList);
    
    if (pointList.length < 2) {
      console.log("There are not enough points to render a route.");
      return;
    }

    var startPoint = pointList.shift();
    var endPoint = pointList.pop();
    var middlePointsList = [];
    if (pointList.length > 2) {
      for (var i = 0; i < pointList.length; i = i + 1) {
        middlePointsList.push({location: pointList[i]});
      }
    }
    
    //demo a default route
    directionsService
      .route({
        origin: startPoint,
        destination: endPoint,
        waypoints: middlePointsList,
        optimizeWaypoints: true,
        travelMode: "BICYCLING",
        provideRouteAlternatives: false
      })
      .then(response => {
        directionsRenderer.setDirections(response);
        setRoutes(response.routes);
        console.log("Set map route");
      });

    return () => directionsRenderer.setMap(null);
  }, [directionsService, directionsRenderer, pointList]);

  // Update direction route
  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer]);

  return (<></>);
}

//Return list of renderable Markers to display on the map with the input route.
export const RouteMarkers = ({ markerInput }) => {}

export default Routing;