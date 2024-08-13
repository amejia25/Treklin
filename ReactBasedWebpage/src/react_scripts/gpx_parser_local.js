// gpx_parser_local.js
// A basic gpx parser component, meant as a non-visible client-side gpx parser.
// Use: include in maps API to extract data if file is added, or to serve as client-side 
// Coders: Jan Baraniecki, Larry Huang

import React, { useState } from 'react';

//parse function (takes in GPX file text)
const parseGPX = (gpxData = `<gpx version="1.1" creator="CyclingRouteMarker"></gpx>`) => {
  //parser setup
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(gpxData, "text/xml");

  //error handling on file issues
  const errorNode = xmlDoc.querySelector("parsererror");
  if (errorNode) {
    //handle parsing failed
    return {error: true};
  }

  //route parsing
  let routes = [];
  let rteElements = xmlDoc.getElementsByTagName("rte");
  for (let i = 0; i < rteElements.length; i++) {
    let route = {points: [], id: rteElements[i].getAttribute("id")};
    let nameElement = rteElements[i].getElementsByTagName("name");
    let descElement = rteElements[i].getElementsByTagName("desc");
    if (nameElement.length > 0) {
      route.name = nameElement[0].textContent;
    }
    if (descElement.length > 0) {
      route.desc = descElement[0].textContent;
    }
    let rteptElements = rteElements[i].getElementsByTagName("rtept");
    for (let j = 0; j < rteptElements.length; j++) {
      let rtept = {
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
    if (route.id === null) {
      //TODO generate id-val
    }
    routes.push(route);
  }

  //track parsing
  let tracks = [];
  let trkElements = xmlDoc.getElementsByTagName("trk");
  for (let i = 0; i < trkElements.length; i++) {
    let track = { id: trkElements[i].getAttribute("id"), points: [] };
    //Note: operates heavily on (paired w/ mobile app's design) 1 segment per track system
    let trksegElements = trkElements[i].getElementsByTagName("trkseg");
    for (let j = 0; j < trksegElements.length; j++) {
        let trkptElements = trksegElements[j].getElementsByTagName("trkpt");
        for (let k = 0; k < trkptElements.length; k++) {
            let lat = parseFloat(trkptElements[k].getAttribute("lat"));
            let lon = parseFloat(trkptElements[k].getAttribute("lon"));
            let point = {
              LatLng: {
                lat: lat,
                lng: lon
              },
              time: null
            };
            let tData = trkptElements[k].getElementsByTagName("time");
            if (tData.length > 0) {
              point.time = tData[0].textContent;
            }
            track.points.push(point);
        }
    }
    if (track.id === null) {
      //TODO generate id-val
    }
    tracks.push(track);
  }

  //waypoint parsing
  let waypoints = [];
  let wptElements = xmlDoc.getElementsByTagName("wpt");
  for (let i = 0; i < wptElements.length; i++) {
    let ratingFound = wptElements[i].getElementsByTagName("rating");
    let ratingNum = 0;
    if (ratingFound.length > 0) {
      ratingNum = parseInt(ratingFound[0].textContent);
    }
    waypoints.push({
      LatLng: {
        lat: parseFloat(wptElements[i].getAttribute("lat")),
        lng: parseFloat(wptElements[i].getAttribute("lon"))
      },
      name: wptElements[i].getElementsByTagName("name")[0].textContent,
      desc: wptElements[i].getElementsByTagName("desc")[0].textContent,
      rating: ratingNum
    });
  }

  //preliminary return object
  let result = {"error": false, "metadata": null, "routes": routes, "tracks": tracks, "waypoints": waypoints};

  //metadata parsing
  let metaElement = xmlDoc.getElementsByTagName("metadata");
  let metadataObj = {};
  let metaDataInclude = false;
  if (metaElement.length > 0) {
    //only one metadata node expected
    let nameElement = metaElement[0].getElementsByTagName("name");
    if (nameElement.length > 0) {
      metaDataInclude = true;
      metadataObj.name = nameElement[0].textContent;
    }
    let descElement = metaElement[0].getElementsByTagName("desc");
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

//The component function
//  saveDataHook: function that should statefully store the GPX data object
const GPXParseLocal = ({ saveDataHook }) => {
  //State handling (displays text info on specific actions)
  const [displayVar, setDisplayVar] = useState(0);
  const stateText = [
    "No file selected.",
    "Invalid file selected.",
    "Local file selected."
  ];

  //on selecting a file on the input, calls the parser function
  const handleFileChange = (event) => {
    console.log(event);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
          const gpxData = e.target.result;
          const parseOutput = parseGPX(gpxData);
          if (parseOutput.error === true) {
            console.log("Error reading gpx-xml data from file.");
            setDisplayVar(1);
            return;
          } else {
            saveDataHook(parseOutput);
            setDisplayVar(2);
          }
      };
      reader.readAsText(file);
    } else {
      setDisplayVar(0);
    }
  };

  //component
  return (
    <div>
      <input id="secureButtons" type="file" accept=".gpx" onChange={handleFileChange}/>
      <p>{stateText[displayVar]}</p>
    </div>
  );
};

export default GPXParseLocal;