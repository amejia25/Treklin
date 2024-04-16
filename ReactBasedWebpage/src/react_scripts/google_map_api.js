// GoogleMapAPI.js
// Loads the Google Map onto the webpage.
//Coder: Jan Baraniecki

//This code is deprecated
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: { lat: 37.7749, lng: -122.4194 } // Default center coordinates (San Francisco)
    });

    // Replace 'YOUR_API_KEY' with your actual Google Maps API key
    var apiKey = 'AIzaSyBgL-iJwE2T1Jm8oUDpVArKUIpGuvPUSI0';

    // Load the GPX file and parse it
    loadGPXFileIntoGoogleMap(map, 'sample.gpx', apiKey);
}

function loadGPXFileIntoGoogleMap(map, filename, apiKey) {
    // Load GPX file using the parser
    loadFile(filename, function (gpxData) {
        parseGPX(gpxData, function (data) {
            var bounds = new google.maps.LatLngBounds();
            var path = [];

            // Create a polyline from the GPX data
            data.forEach(function (track) {
                track.points.forEach(function (point) {
                    var latlng = new google.maps.LatLng(point.lat, point.lon);
                    path.push(latlng);
                    bounds.extend(latlng);
                });
            });

            // Create the map
            map.fitBounds(bounds);
            var route = new google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });

            // Set the map for the polyline
            route.setMap(map);
        });
    });
}

function loadFile(filename, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            callback(xhr.responseText);
        }
    };
    xhr.open("GET", filename, true);
    xhr.send();
}
