import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { photoLocalStore } from './GPXFileList';

export const importedGPXDirectory = `${FileSystem.documentDirectory}imported/`;
export const createdGPXDirectory = `${FileSystem.documentDirectory}created/`;
const GPX_FILE_PATH = `${FileSystem.documentDirectory}created/mainGPXFile.gpx`;
const FILE_COUNTER_KEY = 'FILE_COUNTER_KEY';

const getNewGPXFileName = async () => {

  const currDate = new Date();

  const fileNameDateTime = currDate.getFullYear() + "-" +
                           String(currDate.getMonth() + 1).padStart(2, '0') + "-" +
                           String(currDate.getDate()).padStart(2, '0') + "_" +
                           String(currDate.getHours()).padStart(2, '0') + "-" +
                           String(currDate.getMinutes()).padStart(2, '0') + "-" +
                           String(currDate.getSeconds()).padStart(2, '0');

  //const fileCounter = await incrementFileCounter();
  //return `File${fileCounter}.gpx`; // Return a unique file name

  return `${fileNameDateTime}.gpx`
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
  try {
    const dirInfo = await FileSystem.getInfoAsync(createdGPXDirectory);
    if (!dirInfo.exists) {
      console.log('Creating directory:', createdGPXDirectory);
      await FileSystem.makeDirectoryAsync(createdGPXDirectory, { intermediates: true });
    }

    await FileSystem.writeAsStringAsync(GPX_FILE_PATH, initialContent);
  }catch (e) {
    console.error('Error creating new GPX file:', error);
    throw error;  
  }
  
};

const createNewGPXFile = async () => {
  try {
    // Ensure the directory exists
    const dirInfo = await FileSystem.getInfoAsync(createdGPXDirectory);
    if (!dirInfo.exists) {
      console.log('Creating directory:', createdGPXDirectory);
      await FileSystem.makeDirectoryAsync(createdGPXDirectory, { intermediates: true });
    }

    const newFileName = await getNewGPXFileName();
    const newFilePath = `${createdGPXDirectory}${newFileName}`;
    await FileSystem.writeAsStringAsync(newFilePath, INITIAL_GPX_CONTENT);
    console.log('GPX file created at:', newFilePath);
    return newFilePath;
  } catch (error) {
    console.error('Error creating new GPX file:', error);
    throw error;
  }
};

const deleteWaypointFromGPX = async (filePath, id) => {
  try {
    let fileContent = await FileSystem.readAsStringAsync(filePath);

    const waypointRegex = new RegExp(`<wpt lat="[^"]+" lon="[^"]+">\\s*<name>[^<]+</name>\\s*<desc>${id}</desc>\\s*<rating>[^<]+</rating>\\s*</wpt>`, 'g');
    fileContent = fileContent.replace(waypointRegex, '');

    await FileSystem.writeAsStringAsync(filePath, fileContent);
    console.log(`Waypoint with ID ${id} deleted from GPX file at: ${filePath}`);
  } catch (error) {
    console.error(`Error deleting waypoint from GPX file at ${filePath}:`, error);
  }
};

//TODO add list of useful rating values and descriptions
const addWaypointToGPX = async (filePath, latitude, longitude, rating, id, title = "Waypoint", description = "No Description") => {
  //console.log(`Adding waypoint to GPX file: ${filePath}`);
  console.log('WaypointID: ' + id);
  try {
    //console.log('addWaypointToGPX - filePath:', filePath); // Log the filePath
    let fileContent = await FileSystem.readAsStringAsync(filePath);
    //Default values for title, description. 
    const waypoint =
`<wpt lat="${latitude}" lon="${longitude}">
  <name>${title}</name>
  <desc>${description}</desc>
  <rating>${rating}</rating>
  <id>${id}</id>
</wpt>`;

    fileContent = fileContent.replace("</gpx>", `${waypoint}\n</gpx>`);
    await FileSystem.writeAsStringAsync(filePath, fileContent);
    //console.log('Waypoint added to GPX file at:', filePath); // Log success
  } catch (error) {
    console.error(`Error adding waypoint to GPX file at ${filePath}:`, error);
    throw error; // Re-throw the error to handle it in the calling function
  }
  console.log('Waypoint added:', { latitude, longitude, rating, id });
};

const addRouteToGPX = async (filePath, userLocation, routeId = uuidv4()) => {
  if (!userLocation || userLocation.latitude === 0 || userLocation.longitude === 0) {
    console.error('Invalid user location provided to addRouteToGPX');
    return null;  
  }
  try {
    // Read the existing content from the GPX file.
    let fileContent = await FileSystem.readAsStringAsync(filePath);

    // Create a new route element with the provided location and a generated route ID.
    let routeElement = `<rte id="${routeId}">\n<rtept lat="${userLocation.latitude}" lon="${userLocation.longitude}">\n<name>Start Point</name>\n</rtept>\n</rte>\n`;

    // Insert the new route element into the file content, right before the closing tag of the GPX file.
    fileContent = fileContent.replace("</gpx>", `${routeElement}</gpx>`);

    // Write the updated content back to the GPX file.
    await FileSystem.writeAsStringAsync(filePath, fileContent);

    // Log the creation of the new route.
    console.log(`New route created with ID: ${routeId}`);
  } catch (error) {
    // Log any errors that occur during the process.
    console.error('An error occurred while creating a new route in the GPX file:', error);
    return null;
  }

  // Return the unique ID of the newly created route.
  return routeId;
};

const addRoutePointToGPX = async (filePath, routeId, routePoint) => {
  try {
    // Read the current contents of the GPX file
    let fileContent = await FileSystem.readAsStringAsync(filePath);

    // Define a regex to find the route element by its ID
    const routeRegex = new RegExp(`(<rte id="${routeId}">)([\\s\\S]*?)(</rte>)`, 'm');
    
    // Create a new route point element with latitude, longitude, and name
    const routePointElement = `<rtept lat="${routePoint.latitude}" lon="${routePoint.longitude}">\n<name>${routePoint.name}</name>\n</rtept>\n`;
    
    // Replace the route closing tag with the new route point element followed by the route closing tag
    fileContent = fileContent.replace(routeRegex, `$1$2${routePointElement}$3`);
    
    // Write the updated content back to the GPX file
    await FileSystem.writeAsStringAsync(filePath, fileContent);
    //console.log('Point added to route:', routePoint, ' + File: ', filePath, ' + filePath');
    //console.log(await FileSystem.readAsStringAsync(filePath));

    console.log(`Route point added to ${filePath} under route ID ${routeId}`);
  } catch (error) {
    // Log any errors that occur during the process
    console.error(`Error adding route point to GPX file: ${error}`);
  }
};

const addTrackToGPX = async (filePath) => {
  const trackId = uuidv4();
  try {
    let fileContent = await FileSystem.readAsStringAsync(filePath);

    //new track comes with the single segment used; this may not be practical in the future (see note below)
    let trackElement = `<trk id="${trackId}">\n<type>Cycling</type>\n<trkseg>\n</trkseg>\n</trk>\n`;

    fileContent = fileContent.replace("</gpx>", `${trackElement}</gpx>`);
    await FileSystem.writeAsStringAsync(filePath, fileContent);

    console.log(`New track added with ID: ${trackId}\nTarget GPX: ${filePath}`);
  } catch (error) {
    console.error('An error occured while trying to add track to gpx file', error);
    return null;
  }
  return trackId;
}
//Note: given that we are expecting continuous location data without issue, there isn't much to consider here in terms of track segments.
//  Each track expects only one segment in this organization.
//  This may change upon testing in real-world conditions. Separating it will require an "addTrackSegment" and segment-count tracking for the track.

const extractTimeForTrackpoint = () => {
  //datetime format from XML schema: `YYYY-MM-DDT##:##:##` -> T is the letter itself, YMD# are digits
  let dateTimeObj = new Date();
  let timeYr = String(dateTimeObj.getFullYear());
  let timeMonth = String((dateTimeObj.getMonth() + 1)).padStart(2,'0');
  let timeDay = String(dateTimeObj.getDate()).padStart(2,'0');
  let timeHr = String(dateTimeObj.getHours()).padStart(2,'0');
  let timeMin = String(dateTimeObj.getMinutes()).padStart(2,'0');
  let timeSec = String(dateTimeObj.getSeconds()).padStart(2,'0');
  return `    <time>${timeYr}-${timeMonth}-${timeDay}T${timeHr}:${timeMin}${timeSec}</time>\n  `;
}

//track points should contain datetime data; if it does not, there will be no timestamp included with the track point
//trackPoint --> {latitude: #, longitude: #, dateTime: boolean}
const addTrackPointToGPX = async (filePath, trackId, trackPoint) => {
  try {
    let timeElement = (trackPoint.dateTime === true) ? extractTimeForTrackpoint() : "";
    let fileContent = await FileSystem.readAsStringAsync(filePath);

    const trackPointElement = `  <trkpt lat="${trackPoint.latitude}" lon="${trackPoint.longitude}">\n${timeElement}</trkpt>\n`;

    const trackRegex = new RegExp(`(<trk id="${trackId}">\n<type>Cycling</type>\n<trkseg>\n)([\\s\\S]*?)(</trkseg>\n</trk>)`, 'm');
    fileContent = fileContent.replace(trackRegex, `$1$2${trackPointElement}$3`);
    await FileSystem.writeAsStringAsync(filePath, fileContent);

    console.log(`Added point to track: ${trackPointElement}`);
  } catch (error) {
    console.error(`An error occurred while adding point to track ID ${trackId}:`, error);
    return false;
  }
  return true;
}

const deleteAllImportedPhotos = async () => {
  const photosDirectory = `${FileSystem.documentDirectory}${photoLocalStore}`;
  const storageInfo = await FileSystem.getInfoAsync(photosDirectory);
  if (storageInfo.exists) {
    const photoFiles = await FileSystem.readDirectoryAsync(photosDirectory);
    console.log(photoFiles);
    console.log("clearing photo storage");
    for (photoItem in photoFiles) {
      FileSystem.deleteAsync(`${photosDirectory}${photoFiles[photoItem]}`);
    }
  }
  const expectedEmpty = await FileSystem.readDirectoryAsync(photosDirectory);
  console.log(expectedEmpty);
}

export { GPX_FILE_PATH, createNewGPXFile, addWaypointToGPX, doesGPXFileExist, addRouteToGPX, addRoutePointToGPX, addTrackToGPX, addTrackPointToGPX, createInitGPX, deleteWaypointFromGPX, deleteAllImportedPhotos };
