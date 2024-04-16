// gpx_parser_local.js
// A basic gpx parser component, meant as a non-visible client-side gpx parser.
// Use: include in maps API to extract data if file is added, or to serve as client-side 
//Coders: Jan Baraniecki, Larry Huang

//TODO set up parsing for routes and waypoints
//TODO add functions for handling routes, waypoints, and tracks depending on state

import React, { useState } from 'react';

export const parseGPX = (gpxData = `<gpx version="1.1" creator="CyclingRouteMarker"></gpx>`) => {
  //parser setup
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(gpxData, "text/xml");

  //error handling on file issues
  const errorNode = xmlDoc.querySelector("parsererror");
  if (errorNode) {
    //handle parsing failed
    return {error: true};
  }

  //route parsing
  var routes = [];
  var rteElements = xmlDoc.getElementsByTagName("rte");
  for (var i = 0; i < rteElements.length; i++) {
    var route = {points: []};
    var nameElement = rteElements[i].getElementsByTagName("name");
    var descElement = rteElements[i].getElementsByTagName("desc");
    if (nameElement.length > 0) {
      route.name = nameElement[0].textContent;
    }
    if (descElement.length > 0) {
      route.desc = descElement[0].textContent;
    }
    var rteptElements = rteElements[i].getElementsByTagName("rtept");
    for (var j = 0; j < rteptElements.length; j++) {
      var rtept = {
        LatLng: {
          lat: parseFloat(rteptElements[j].getAttribute("lat")),
          lng: parseFloat(rteptElements[j].getAttribute("lon"))
        }
      };
      nameElement = rteptElements[j].getElementsByTagName("name");
      if (nameElement.length > 0) {
        rtept.name = nameElement[0].textContent;
      }
      descElement = rteptElements[j].getElementsByTagName("desc");
      if (descElement.length > 0) {
        rtept.desc = descElement[0].textContent;
      }
      route.points.push(rtept);
    }
    routes.push(route);
  }

  //track parsing
  var tracks = [];
  var trkElements = xmlDoc.getElementsByTagName("trk");
  for (i = 0; i < trkElements.length; i++) {
    var track = { id: trkElements[i].getAttribute("id"), points: [] };//TODO check for not-present attribute value
    //Note: operates heavily on (paired w/ mobile app's design) 1 segment per track system
    var trksegElements = trkElements[i].getElementsByTagName("trkseg");
    for (j = 0; j < trksegElements.length; j++) {
        var trkptElements = trksegElements[j].getElementsByTagName("trkpt");
        for (var k = 0; k < trkptElements.length; k++) {
            var lat = parseFloat(trkptElements[k].getAttribute("lat"));
            var lon = parseFloat(trkptElements[k].getAttribute("lon"));
            var point = {
              LatLng: {
                lat: lat,
                lng: lon
              },
              time: null
            };
            var tData = trkptElements[k].getElementsByTagName("time");
            if (tData.length > 0) {
              point.time = tData[0].textContent;
            }
            track.points.push(point);
        }
    }
    tracks.push(track);
  }

  //waypoint parsing
  var waypoints = [];
  var wptElements = xmlDoc.getElementsByTagName("wpt");
  for (i = 0; i < wptElements.length; i++) {
    waypoints.push({
      LatLng: {
        lat: parseFloat(wptElements[i].getAttribute("lat")),
        lng: parseFloat(wptElements[i].getAttribute("lon"))
      },
      name: wptElements[i].getElementsByTagName("name")[0].textContent,
      desc: wptElements[i].getElementsByTagName("desc")[0].textContent,
      rating: parseInt(wptElements[i].getElementsByTagName("rating")[0])
    });
  }

  var result = {"error": false, "metadata": null, "routes": routes, "tracks": tracks, "waypoints": waypoints};
  //metadata parsing
  var metaElement = xmlDoc.getElementsByTagName("metadata");
  var metadataObj = {};
  var metaDataInclude = false;
  if (metaElement.length > 0) {
    //only one metadata node expected
    nameElement = metaElement[0].getElementsByTagName("name");
    if (nameElement.length > 0) {
      metaDataInclude = true;
      metadataObj.name = nameElement[0].textContent;
    }
    descElement = metaElement[0].getElementsByTagName("desc");
    if (descElement.length > 0) {
      metaDataInclude = true;
      metadataObj.desc = descElement[0].textContent;
    }
  }
  if (metaDataInclude) {
    result.metadata = metadataObj;
  }
  //console.log(result);
  return result;
};

const GPXParseLocal = ({ saveDataHook }) => {
  const [routes, setRoutes] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [waypoints, setWaypoints] = useState([]);
  const [metadata, setMetadata] = useState({});

  //this component stores the input gpx file data in its three categories
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
          const gpxData = e.target.result;
          const parseOutput = parseGPX(gpxData);
          if (gpxData.error === true) {
            console.log("Error reading gpx-xml data from file.");
            //TODO visual user alert
            return;
          } else {
            saveDataHook(parseOutput);
          }
      };
      reader.readAsText(file);
    }
  };

  return (<input id="secureButtons" type="file" accept=".gpx" onChange={handleFileChange}/>);
};

export default GPXParseLocal;