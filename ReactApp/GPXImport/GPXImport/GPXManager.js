import * as FileSystem from 'expo-file-system';

const GPX_FILE_PATH = `${FileSystem.documentDirectory}myGPXFile.gpx`;

const createNewGPXFile = async () => {
  const initialContent = `<?xml version="1.0" encoding="UTF-8"?>
  <gpx version="1.1" creator="YourApp">
  </gpx>`;

  await FileSystem.writeAsStringAsync(GPX_FILE_PATH, initialContent);
};

const addWaypointToGPX = async (latitude, longitude, rating) => {
  let fileContent = await FileSystem.readAsStringAsync(GPX_FILE_PATH);

  const waypoint = `<wpt lat="${latitude}" lon="${longitude}">
    <name>Waypoint</name>
    <rating>${rating}</rating>
  </wpt>`;

  fileContent = fileContent.replace("</gpx>", `${waypoint}\n</gpx>`);

  await FileSystem.writeAsStringAsync(GPX_FILE_PATH, fileContent);
};

export { createNewGPXFile, addWaypointToGPX, GPX_FILE_PATH };
