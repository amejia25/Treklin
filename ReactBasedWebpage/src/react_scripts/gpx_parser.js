// gpx_Parser.js
// A basic gpx parser to get started in reading gpx files returning data that can go into google maps.
//Coder: Jan Baraniecki

export const parseGPX = (gpxData) => {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(gpxData, "text/xml");

    var tracks = [];
    var trkElements = xmlDoc.getElementsByTagName("trk");
    for (var i = 0; i < trkElements.length; i++) {
        var track = { points: [] };
        var trksegElements = trkElements[i].getElementsByTagName("trkseg");
        for (var j = 0; j < trksegElements.length; j++) {
            var trkptElements = trksegElements[j].getElementsByTagName("trkpt");
            for (var k = 0; k < trkptElements.length; k++) {
                var lat = parseFloat(trkptElements[k].getAttribute("lat"));
                var lon = parseFloat(trkptElements[k].getAttribute("lon"));
                var point = { lat: lat, lon: lon };
                track.points.push(point);
            }
        }
        tracks.push(track);
    }
    return tracks;
};