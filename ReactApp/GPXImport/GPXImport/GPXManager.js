import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GPX_FILE_PATH = `${FileSystem.documentDirectory}myGPXFile.gpx`;
const FILE_COUNTER_KEY = 'FILE_COUNTER_KEY';

const getNewGPXFileName = async () => {
  const fileCounter = await incrementFileCounter();
  return `File${fileCounter}.gpx`; // Return a unique file name
};

const incrementFileCounter = async () => {
  const counterString = await AsyncStorage.getItem(FILE_COUNTER_KEY);
  let fileCounter = counterString ? parseInt(counterString, 10) : 0;
  fileCounter += 1; // Increment the counter for each new file
  await AsyncStorage.setItem(FILE_COUNTER_KEY, fileCounter.toString());
  return fileCounter;
};

const INITIAL_GPX_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="YourApp">
</gpx>`;

const doesGPXFileExist = async () => {
  const fileInfo = await FileSystem.getInfoAsync(GPX_FILE_PATH);
  return fileInfo.exists;
};

const createInitGPX = async () => {
  const initialContent = `<?xml version="1.0" encoding="UTF-8"?>
  <gpx version="1.1" creator="YourApp">
  </gpx>`;

  await FileSystem.writeAsStringAsync(GPX_FILE_PATH, initialContent);
};

const createNewGPXFile = async () => {
  console.log('Creating new GPX file...');
  try {
    const newFileName = await getNewGPXFileName();
    const newFilePath = `${FileSystem.documentDirectory}${newFileName}`;

    await FileSystem.writeAsStringAsync(newFilePath, INITIAL_GPX_CONTENT);
    console.log('GPX file created at:', newFilePath); // Log the new file path
    return newFilePath; // Return the new file path for further use
  } catch (error) {
    console.error('Error creating new GPX file:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }

};

const addWaypointToGPX = async (filePath, latitude, longitude, rating) => {
  console.log(`Adding waypoint to GPX file: ${filePath}`);
  try {
    console.log('addWaypointToGPX - filePath:', filePath); // Log the filePath
    let fileContent = await FileSystem.readAsStringAsync(filePath);

    const waypoint = `<wpt lat="${latitude}" lon="${longitude}">
      <name>Waypoint</name>
      <rating>${rating}</rating>
    </wpt>`;

    fileContent = fileContent.replace("</gpx>", `${waypoint}\n</gpx>`);

    await FileSystem.writeAsStringAsync(filePath, fileContent);
    console.log('Waypoint added to GPX file at:', filePath); // Log success
  } catch (error) {
    console.error(`Error adding waypoint to GPX file at ${filePath}:`, error);
    throw error; // Re-throw the error to handle it in the calling function
  }
  console.log('Waypoint added:', { latitude, longitude, rating });
};


const addRouteToGPX = async (filePath, routePoints) => {
  console.log(`Adding route to GPX file: ${filePath}`);
  try {
    console.log('addRouteToGPX - filePath:', filePath); // Log the filePath
    let fileContent = await FileSystem.readAsStringAsync(filePath);
    let routeElement = '<rte>\n';

    routePoints.forEach(point => {
      routeElement += `<rtept lat="${point.latitude}" lon="${point.longitude}">\n`;
      routeElement += `<name>${point.name}</name>\n</rtept>\n`;
    });

    routeElement += '</rte>\n';
    fileContent = fileContent.replace("</gpx>", `${routeElement}</gpx>`);

    await FileSystem.writeAsStringAsync(filePath, fileContent); 
  } catch (error) {
    console.error('An error occurred while adding route to GPX file:', error);
  }
  console.log('Route added:', routePoints);
};

export { GPX_FILE_PATH, createNewGPXFile, addWaypointToGPX, doesGPXFileExist, addRouteToGPX, createInitGPX};

