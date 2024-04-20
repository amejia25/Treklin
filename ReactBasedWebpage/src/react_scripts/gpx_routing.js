// gpx_routing.js
// Provides an object that acts on a sibling Map (key provided by parent APIProvider) to render route navigation
// It also provides basic rendering for waypoints (as Markers) and tracks (as Polylines)
//
//Coder: Larry Huang
//

import React, { useEffect, useState } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';

/***
 * Arguments passed to Routing component:
 *  gpxData: JSONobj GPX file data
 *  gpxCategory: JSONobj true/false of rendering
 *  markerOutputCall: function called when route is rendered, to hook into displayed route point data
 */
export const Routing = ({ gpxData = {}, gpxCategory, markerOutputCall=()=>{} }) => {  
  //Routes and tracks will rendered using different methods
    // A: routes will use the directionsService to display a bike-usable path
    // B: tracks can use their existing coordinate data due to the higher number of points and real-point data

  //core contents (code that runs to plot route)
  const map = useMap("reactGoogleMap");
  const routesLibrary = useMapsLibrary('routes');
  const mapMarkerLib = useMapsLibrary('marker');
  const coreLib = useMapsLibrary('maps');
  const streetLib = useMapsLibrary('streetView');
  const [directionsService, setDirectionsService] = useState();//<google.maps.DirectionsService>
  const [directionsRenderer, setDirectionsRenderer] = useState();//<google.maps.DirectionsRenderer>
  const [routes, setRoutes] = useState([]);//<google.maps.DirectionsRoute[]>
  const [infoWindowInst, setInfoWindowInst] = useState(null);//google.maps.InfoWindow
  const [routeIndex, setRouteIndex] = useState(0);
  const [pointList, setPointList] = useState([]);//passed to route renderer
  const [trackContents, setTrackContents] = useState([]);
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  //modify route-point list to an appropriate setting when the data passed to the router
  useEffect(() => {
    console.log("New file data!");
    console.log(gpxData);

    //route data
    try {
      let routePointList = [];
      for (let i = 0; i < gpxData.routes[0].points.length; i = i + 1) {
        routePointList.push(gpxData.routes[0].points[i].LatLng);
      }
      //TODO add control to prevent propogation loop when editing
      setPointList(routePointList);
      markerOutputCall(routePointList);
    } catch (error) {
      //the try-contained code causes a startup error with gpxData={}; this keeps it from crashing app
      console.log("Point lists were not updated or sent out, or the gpxData has not been populated yet.");
      setPointList([]);
      markerOutputCall([]);
    }

    //tracks transformed into simple array-of-array-of-points (no editing)
    try {
      let trackList = [];
      for (let i = 0; i < gpxData.tracks.length; i = i + 1) {
        let currentTrack = [];
        //collect list of points from each track
        for (let j = 0; j < gpxData.tracks[i].points.length; j = j + 1) {
          currentTrack.push(gpxData.tracks[i].points[j].LatLng);
        }
        trackList.push(currentTrack);
      }
      setTrackContents(trackList);
    } catch (error) {
      console.log("error loading polylines for tracks");
      setTrackContents([]);
    }

    //waypoints can be used as-is in gpxData
  }, [gpxData, markerOutputCall]);

  //render contents of the tracks using polylines
  useEffect(() => {
    if (!map) return;
    if (gpxCategory.track === false) return;

    console.log("Tracks rendering...");

    let lineList = [];
    for (let i = 0; i < trackContents.length; i = i + 1) {
      let newPoly = new coreLib.Polyline({
        path: trackContents[i],
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      lineList.push(newPoly);
    }
    lineList.map((poly) => poly.setMap(map));
    return () => {
      lineList.map((poly) => poly.setMap(null));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackContents, gpxCategory.track, map]);

  
  //set contents of the waypoints
  useEffect(() => {
    if (!map) return;
    if (gpxCategory.waypt === false) return;

    if (infoWindowInst === null) {
      setInfoWindowInst(new streetLib.InfoWindow());
    }
    
    //Constants for marker appearances & text display
    const ratingVal = ["Unknown", "Bad", "Neutral", "Good"];
    const MarkerAesthetics = [
      {
        borderColor: "#242124",
        background: "#696969",
        glyph: "",
        scale: 1.3
      },
      {
        borderColor: "#242124",
        background: "#ff4500",
        glyph: "",
        scale: 1.5
      },
      {
        borderColor: "#242124",
        background: "#696969",
        glyph: "",
        scale: 1.5
      },
      {
        borderColor: "#242124",
        background: "#2e8b57",
        glyph: "",
        scale: 1.5
      }
    ];

    try {
      //create set of markers and store
      let wayptMarkers = [];
      gpxData.waypoints.forEach(({name = "", desc = "", rating = 0, LatLng = {lat: 0.0, lng: 0.0}}) => {
        let markName;
        if (Number.isInteger(rating)) {
          markName = name + " - " + ratingVal[rating];
        } else {
          markName = name;
        }
        let newMarker = new mapMarkerLib.AdvancedMarkerElement({
          map,
          position: LatLng,
          title: markName,
          content: (new mapMarkerLib.PinElement(MarkerAesthetics[rating])).element
        });
        //additional info-display on clicking waypoint
        newMarker.addListener("click",  ({ domEvent }) => {
          //const { target } = domEvent;
          infoWindowInst.close();
          infoWindowInst.setContent(desc);
          infoWindowInst.open(newMarker.map, newMarker);
        });
        wayptMarkers.push(newMarker);
      });

      //cleanup function
      return () => {
        wayptMarkers.forEach((markerItem) => {
          markerItem.setMap(null);
        });
      };
    } catch (error) {
      console.log("Waypoint loading failed.");
      console.log(error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpxData.waypoints, gpxCategory.waypt, map]);

  //target the current map object and add a route service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({map}));
  }, [routesLibrary, map]);

  //add a system to modify the directionRenderer based upon settings at top of screen
  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setOptions({
      suppressMarkers: false,
      draggable: gpxCategory.routeDrag
    });
  }, [directionsRenderer, gpxCategory.routeDrag]);

  //add save listener on directions renderer for user changes
  useEffect(() => {
    if (!directionsRenderer) return;

    directionsRenderer.addListener("directions_changed", ()=>{
      console.log("New route after drag:");   
      console.log((directionsRenderer.getDirections()));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directionsRenderer]);
  
  // on changes to the routing and/or rendering service objects, if both are present, acquire routing data from API (and return render-clearing cleanup)
  useEffect(() => {
    //avoid undefined error
    if (!directionsService || !directionsRenderer) return;
    //nothing to plot (no route)
    if (pointList.length < 2) {
      //console.log("There are not enough points to render a route.");
      return;
    }
  
    //route data changes propogate from map, not gpxData, at this time
    //if (gpxCategory.routeDrag) return; //TODO fix render-clear on gpxCategory.routeDrag==true

    //plot route points from gpxData
    if (gpxCategory.route) {
      console.log("Render route = true;");

      //separate start and end from other points for routing
      let startPoint = pointList[0];
      let endPoint = pointList[pointList.length - 1];
      let middlePointsList = [];
      if (pointList.length > 2) {
        for (let i = 1; i < pointList.length - 1; i = i + 1) {
          middlePointsList.push({location: pointList[i], stopover: false});
        }
      }
    
      //make API call and load the response into the renderer
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
          directionsRenderer.setMap(map);
          directionsRenderer.setDirections(response);
          setRoutes(response.routes);
          console.log("Set map route; bugged if not visible.");
        });
  
      //cleanup hook
      return () => directionsRenderer.setMap(null);
    } else {//don't plot route
      console.log("Render route = false;");
    }
  }, [map, directionsService, directionsRenderer, pointList, gpxCategory.route]);

  // Update direction route
  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer]);

  return (<></>);
}

export default Routing;