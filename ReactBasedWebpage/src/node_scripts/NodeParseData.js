const xml2js = require('xml2js');

class GPXParser {
    static parse(fileContent, gpxId) {
        return new Promise((resolve, reject) => {
            const parser = new xml2js.Parser({ mergeAttrs: true, explicitArray: false });
            parser.parseString(fileContent, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                console.log(JSON.stringify(result));  // Debug: Log the entire parsed result

                let gpxData = {
                    gpxId: gpxId,
                    waypoints: [],
                    tracks: [],
                    routes: []
                };

                // Parsing waypoints
                if (result.gpx && result.gpx.wpt) {
                    gpxData.waypoints = Array.isArray(result.gpx.wpt) ? result.gpx.wpt.map(wpt => parseWaypoint(wpt, gpxId)) : [parseWaypoint(result.gpx.wpt, gpxId)];
                }

                // Parsing tracks, segments, and track points
                if (result.gpx && result.gpx.trk) {
                    gpxData.tracks = Array.isArray(result.gpx.trk) ? result.gpx.trk.map(trk => parseTrack(trk, gpxId)) : [parseTrack(result.gpx.trk, gpxId)];
                }

                // Parsing routes and route points
                if (result.gpx && result.gpx.rte) {
                    gpxData.routes = Array.isArray(result.gpx.rte) ? result.gpx.rte.map(rte => parseRoute(rte, gpxId)) : [parseRoute(result.gpx.rte, gpxId)];
                }

                resolve(gpxData);
            });
        });
    }
}

function parseWaypoint(wpt, gpxId) {
    return {
        file_id: gpxId,
        latitude: wpt.lat,
        longitude: wpt.lon,
        name: wpt.name || null,
        description: wpt.desc || null
    };
}

function parseTrack(trk, gpxId) {
    return {
        file_id: gpxId,
        name: trk.name || null,
        segments: trk.trkseg ? (Array.isArray(trk.trkseg) ? trk.trkseg.map(seg => parseSegment(seg)) : [parseSegment(trk.trkseg)]) : []
    };
}

function parseRoute(rte, gpxId) {
    return {
        file_id: gpxId,
        name: rte.name || null,
        points: rte.rtept ? (Array.isArray(rte.rtept) ? rte.rtept.map(pt => parsePoint(pt)) : [parsePoint(rte.rtept)]) : []
    };
}

function parseSegment(seg) {
    return {
        points: seg.trkpt ? (Array.isArray(seg.trkpt) ? seg.trkpt.map(pt => parsePoint(pt)) : [parsePoint(seg.trkpt)]) : []
    };
}

function parsePoint(pt) {
    return {
        latitude: pt.lat,
        longitude: pt.lon,
        elevation: pt.ele || null,
        time: pt.time ? new Date(pt.time) : null
    };
}

module.exports = GPXParser;
