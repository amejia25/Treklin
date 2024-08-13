// save_gpx_calls.js
// function used to save GPX data in the home tab's GPX object to the user device
//
// Coder: Larry Huang

const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Treklyn">`;
const gpxTail = `</gpx>`;

const convertToXMLtext = (gpxFileContents) => {
  console.log(gpxFileContents);

  //NOTE: the following are in try-catch blocks to avoid editing and parse-based crashes
  //an issue in one area simply causes the xml to drop it on the way

  //metadata
  try {
    var metaList = [];
    if (gpxFileContents.metadata !== null) {
      metaList.push('<metadata>');
      var metadataTag;
      for (metadataTag in gpxFileContents.metadata) {
        metaList.push(`<${metadataTag}>${gpxFileContents.metadata[metadataTag]}</${metadataTag}>`);
      }
      metaList.push('</metadata>');
    } else {
      console.log("No metadata found.");
    }
  } catch (error) {
    console.log("Error extracting metadata; section dropped.");
    console.log(error);
    metaList = [];
  }

  //append route items
  try {
    var routeList = [];
    if (gpxFileContents.routes.length > 0) {
      for (let a = 0; a < gpxFileContents.routes.length; a = a + 1) {
        let currentRoute = gpxFileContents.routes[a];
        //open with id if present, w/o if not
        if (currentRoute.id !== undefined) {
          routeList.push(`<rte id="${currentRoute.id}" >`);
        } else {
          routeList.push("<rte>");
        }
        //subnode properties
        if (currentRoute.name !== undefined) {}
        if (currentRoute.desc !== undefined) {}
        //iterate through route points
        for (let b = 0; b < currentRoute.points.length; b = b + 1) {
          let curPoint = currentRoute.points[b], hasSub = false;
          var nameItem = "", descItem = "";
          if (curPoint.name !== undefined) {
            nameItem = `<name>${curPoint.name}</name>\n`;
            hasSub = true;
          }
          if (curPoint.desc !== undefined) {
            descItem = `<desc>${curPoint.desc}</desc>\n`;
            hasSub = true;
          }
          if (hasSub) {
            routeList.push(`<rtept lat="${curPoint.LatLng.lat}" lon="${curPoint.LatLng.lng}" >\n${nameItem}${descItem}<rtept/>`);
          } else {
            routeList.push(`<rtept lat="${curPoint.LatLng.lat}" lon="${curPoint.LatLng.lng}" />`);
          }
        }
        //close
        routeList.push("</rte>");
      }
    } else {
      console.log("No routes found.");
    }
  } catch (error) {
    console.log("Error extracting routes; section dropped.");
    console.log(error);
    routeList = [];
  }
  //append track items
  try {
    var trackList = [];
    if (gpxFileContents.tracks.length > 0) {
      for (let a = 0; a < gpxFileContents.tracks.length; a = a + 1) {
        //add a track as a single segment
        let curTrack = gpxFileContents.tracks[a];
        if (curTrack.id !== undefined) {
          trackList.push(`<trk id="${curTrack.id}" >`);
        } else {
          trackList.push("<trk>");
        }
        trackList.push("<trkseg>");
        //iterate through points in this track
        for (let b = 0; b < curTrack.points.length; b = b + 1) {
          let curPoint = curTrack.points[b];
          //add each trackpoint's coordinates in its opener, and add the timestamp as its own line if present
          if (curPoint.time !== undefined) {
            trackList.push(`<trkpt lat="${curPoint.LatLng.lat}" lon="${curPoint.LatLng.lng}" >\n<time>${curPoint.time}</time>\n</trkpt>`);
          } else {
            trackList.push(`<trkpt lat="${curPoint.LatLng.lat}" lon="${curPoint.LatLng.lng}" ></trkpt>`);
          }
        }
        trackList.push("</trkseg>\n</trk>");
      }
    } else {
      console.log("No tracks found.");
    }
  } catch (error) {
    console.log("Error extracting tracks; section dropped.");
    console.log(error);
    trackList = [];
  }
  //append waypoint items
  try {
    var wayptList = [];
    if (gpxFileContents.waypoints.length > 0) {
      for (let a = 0; a < gpxFileContents.waypoints.length; a = a + 1) {
        //add each waypoint, checking for XML child node data
        wayptList.push(`<wpt lat="${gpxFileContents.waypoints[a].LatLng.lat}" lon="${gpxFileContents.waypoints[a].LatLng.lng}" >`);
        if (gpxFileContents.waypoints[a].name !== undefined) {
          wayptList.push(`<name>${gpxFileContents.waypoints[a].name}</name>`);
        }
        if (gpxFileContents.waypoints[a].desc !== undefined) {
          wayptList.push(`<desc>${gpxFileContents.waypoints[a].desc}</desc>`);
        }
        if (gpxFileContents.waypoints[a].rating !== undefined) {
          wayptList.push(`<rating>${gpxFileContents.waypoints[a].rating}</rating>`);
        } else {
          wayptList.push(`<rating>2</rating>`);
        }
        wayptList.push('</wpt>');
      }
    } else {
      console.log("No waypoints found.");
    }
  } catch (error) {
    console.log("Error extracting waypoints; section dropped.");
    console.log(error);
    wayptList = [];
  }
  //build doc and return
  let xmlLineList = [
    ...metaList,
    ...routeList,
    ...trackList,
    ...wayptList
  ];
  xmlLineList.unshift(gpxHeader);
  xmlLineList.push(gpxTail);
  //console.log(xmlLineList);
  return xmlLineList.join("\n");
};

export {convertToXMLtext};