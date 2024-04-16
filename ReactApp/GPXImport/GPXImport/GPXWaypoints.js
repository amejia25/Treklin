import React, { useState, useRef, useEffect} from 'react';
import { View, Platform, StyleSheet, Alert, TouchableOpacity, Text, ActivityIndicator, Image, Dimensions} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import FlashMessage from 'react-native-flash-message';
import { showMessage } from 'react-native-flash-message';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrient from 'expo-screen-orientation';
import { Gesture, GestureDetector, Directions } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { doesGPXFileExist, createNewGPXFile, addWaypointToGPX, GPX_FILE_PATH, addTrackToGPX, addTrackPointToGPX, createInitGPX, deleteWaypointFromGPX, deleteAllImportedPhotos, createdGPXDirectory } from './GPXManager';
import { deleteFile, photoWaypointsFile, photoLocalStore } from './GPXFileList';  
import { pickImage } from './ImageImport';
import WaypointModal from './WaypointModal';
import GPXNameModal from './GPXNameModal';
import { styles } from './styles';

//Icons Import
import zoomInIcon from './assets/icons/zoomIn.png';
import zoomOutIcon from './assets/icons/zoomOut.png';
//Check how far the user is from a route start.
//Uses Haversine Formula
const getDistanceFromLatLonInMiles = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
};

const recordActiveDir = "locks";
export const recordActiveFile = "locks/lock-record.txt";

const GPXWaypoints = ({ navigation, route }) => {
  const handleGPXNameConfirm = async (fileName) => {
    // Rename the GPX file here using FileSystem from 'expo-file-system'
    const newPath = `${createdGPXDirectory}${fileName}.gpx`;
    try {
      await FileSystem.moveAsync({
        from: currentGPXPath,
        to: newPath,
      });
      console.log(`GPX file renamed to: ${newPath}`);
    } catch (error) {
      console.error('Error renaming GPX file:', error);
      showMessage({
        message: "Error renaming GPX file",
        description: "Please try again.",
        hideOnPress: true,
        type: "error",
        duration: 3000 
      });
    } finally {
      // Navigate and reset state after handling rename
      setCurrentGPXPath(''); 
      setGpxNameModalVisible(false); // Close the modal
      // Navigate away or refresh the list as needed
      navigation.navigate('GPX Files', { refreshFileList: true });
    }
  };  

  //Add a state variable to store the map rotation
  const [mapRotation, setMapRotation] = useState(0);


  //Location and map state/refs
  const [waypoints, setWaypoints] = useState([]);
  const [imported, setImported] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [currentRoute, setCurrentRoute] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  //const [locationPerm, setLocationPerm] = useState(false);
  const mapRef = useRef(null);
  const userLocationRef = useRef(userLocation);
  const [hasAnimatedToUserLocation, setHasAnimatedToUserLocation] = useState(false);
  const [latitudeDeltaDefault, setLatitudeDeltaDefault] = useState(0.0922);
  const [longitudeDeltaDefault, setLongitudeDeltaDefault] = useState(0.0421);
  const zoomScalar = 2;

  //Waypoint Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [waypointRating, setWaypointRating] = useState(null);
  const [waypointLat, setWaypointLat] = useState(0);
  const [waypointLon, setWaypointLon] = useState(0);
  const [waypointLink, setWaypointLink] = useState("");//TODO use to update modal description automatically when taking photo

  //Imorted GPX data
  const [importedWaypoints, setImportedWaypoints] = useState([]);
  const [importedRoutes, setImportedRoutes] = useState([]);

  //Active route state
  const [isCycling, setIsCycling] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const [currentGPXPath, setCurrentGPXPath] = useState('');
  const [photoGPXdata, setPhotoGPXdata] = useState([]);//deprecated, but may be useful so it's still here
  
  //Permission states
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  
  //GPX name Modal states
  const [gpxNameModalVisible, setGpxNameModalVisible] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  // // DECLARED TWICE FOR SOME REASON. COMMENTING OUT FOR NOW JUST IN CASE IT BREAKS SOMETHING. 
  // // Modal activity at the end of route-recording.
  // const handleGPXNameConfirm = async (fileName) => {
  //   // Rename the GPX file here using FileSystem from 'expo-file-system'
  //   const newPath = `${FileSystem.documentDirectory}${fileName}.gpx`;
  //   try {
  //     await FileSystem.moveAsync({
  //       from: currentGPXPath,
  //       to: newPath,
  //     });
  //     console.log(`GPX file renamed to: ${newPath}`);
  //     setCurrentGPXPath(''); // Reset the current GPX file path
  //     // Navigate away or refresh the list as needed
  //     navigation.navigate('GPX Files', { refreshFileList: true });
  //   } catch (error) {
  //     console.error('Error renaming GPX file:', error);
  //     showMessage({
  //       message: "Error renaming GPX file",
  //       description: "Please try again.",
  //       hideOnPress: true,
  //       type: "error",
  //       duration: 3000 
  //     });
  //   }
  //   setGpxNameModalVisible(false); // Close the modal
  // };

  //Zoom States
  const zoomLevels = {
    zoomedOut: { latitudeDelta: 0.0922, longitudeDelta: 0.0421 }, // Zoom Out
    zoomedIn: { latitudeDelta: 0.005, longitudeDelta: 0.005 }, // Zoom In
  };
  const [currentZoom, setCurrentZoom] = useState(zoomLevels.zoomedOut); 
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  useEffect(() => {
    if (route.params?.gpxFilePath) {
      const filePath = route.params.gpxFilePath;
      importGPXFileFromPath(filePath);
      navigation.setParams({ gpxFilePath: null }); // Reset the parameter
    }
  }, [route.params?.gpxFilePath]);

  useEffect(() => {
    if (route.params?.imported) {
        setImported(true);
    }
  }, [route.params?.imported]);

  // keeps the user centered on the map during route
  useEffect(() => {
    if (userLocation && mapRef.current && isCycling) {
      const region = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.005, 
        longitudeDelta: 0.005,
      };
      mapRef.current.animateToRegion(region, 1000); 
    }
  }, [userLocation, isCycling]); // Will re-run when userLocation or isCycling changes

  //Update the userLocRef
  useEffect(() => {
    userLocationRef.current = userLocation; 
  }, [userLocation]);
  
  useEffect(() => {
    let locationSubscription;

    const startLocationTracking = async () => {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const response = await Location.requestForegroundPermissionsAsync();
        status = response.status;
      }
      setHasLocationPermission(status === 'granted');
    
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }
    
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          const zoomLevel = 0.007; 
          const userLoc = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: zoomLevel, 
            longitudeDelta: zoomLevel, 
          };
          setUserLocation(userLoc);
          setIsMapReady(true);
    
          // Animate to the user's location with more zoom when starting the route
          if (isCycling && mapRef.current) {
            mapRef.current.animateToRegion(userLoc, 1000); 
          }
        }
      );
    };

    startLocationTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  //Animate to the user's location
  const onMapReady = () => {
    if (userLocation && mapRef.current && !hasAnimatedToUserLocation) {
      setHasAnimatedToUserLocation(true);
      setIsMapReady(true);
      centerOnUserLocation();
    }
  };
  
  //Start timer function
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prevTime => prevTime + 1);
    }, 1000);
  };

  //Stop the timer function
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setElapsedTime(0);
    }
  };

  // Asks user to confirm stopping the route with dialog box
  const confirmStopRoute = () => {
    Alert.alert(
      "Confirm Stop",
      "Are you sure you want to stop the route?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Route stopping cancelled"),
          style: "cancel"
        },
        { text: "Yes", onPress: () => stopRoute() }
      ],
      { cancelable: false }
    );
  };

  //To Stop Recording a Route
  const stopRoute = async () => {
    try {
      setIsCycling(false);
      stopTimer();
  
      if (currentGPXPath) {
        console.log('Stopping route, current GPX path:', currentGPXPath);
  
        if (routes.length === 0 && waypoints.length === 0) {
          // No waypoints or routes to add, delete the file
          deleteFile(currentGPXPath);
          setCurrentGPXPath('');
          //console.log('No waypoints or routes. File deleted.');
          
          showMessage({
            message: "Route Not Saved",
            description: "Route wasn't long enough to be saved. Try adding waypoints!",
            hideOnPress: true,
            type: "info",
            duration: 3000 
          });
        } else {
          // Save the route and waypoints to the current file
          // (Uncomment and implement the logic for saving waypoints and routes)
  
          // Log the content of the GPX file
          // const fileContent = await FileSystem.readAsStringAsync(currentGPXPath);
          // console.log('GPX File Content:', fileContent);

          showMessage({
            message: "Route has ended.",
            hideOnPress: true,
            type: "info",
            duration: 2000
          });
          setGpxNameModalVisible(true);
        }
      } else {
        console.error('No GPX file path found when trying to stop route');
        showMessage({
          message: "Could not save created route to GPX File",
          hideOnPress: true,
          type: "error",
          duration: 3000 
        });
      }
    } catch (error) {
      console.error('Error in stopRoute:', error);
    }
  };

  //Effect to create the initial GPX file if it doesn't exist, and display its waypoints on the home screen upon loading.
  //NOTE: question - why are we including the main gpx's waypoints all at the start? I've forgotten why - Larry
  useEffect(() => {
    const newGPXsetup = async () => {
      const gpxExists = await doesGPXFileExist();
      if (!gpxExists) {
        await createInitGPX();
      }
  //     /*else {
  //       await importGPXFileFromPath(GPX_FILE_PATH);
  //       setImportedRoutes([]);
  //     }*/
  //   };
  // // useEffect(() => {
  // //   const loadWaypointsFromGPX = async () => {
  // //     const gpxExists = await doesGPXFileExist();
  // //     if (!gpxExists) {
  // //       await createInitGPX();
  // //     } 
  // //     // else {
  // //     //   await importGPXFileFromPath(GPX_FILE_PATH);
  // //     //   setImportedRoutes([]);
  // //     // }
    };
    if (isMapReady) {
      newGPXsetup();
    }
  }, [isMapReady]);

  //Update goodMarkerPress to show modal and set rating to 3
  const goodMarkerPress = () => {
    setWaypointLocationUser();
    setWaypointRating(3);
    setModalVisible(true); //Show Waypoint Modal
  };
  // Update badMarkerPress similarly, but set rating to 1
  const badMarkerPress = () => {
    setWaypointLocationUser();
    setWaypointRating(1);
    setModalVisible(true); //Show Waypoint Modal
  };
  //helper method setting the waypoint modal's coordinates to the user location
  const setWaypointLocationUser = () => {
    setWaypointLat(userLocation.latitude);
    setWaypointLon(userLocation.longitude);
  }

  // Function to handle modal confirm
  const handleAddWaypoint = async (title, description, rating) => {
    const waypointId = Date.now().toString();
    const waypointTitle = title.trim() !== '' ? title : 'Unnamed Waypoint'; // Default to 'Unnamed Waypoint' if title is left empty
    const waypointDescription = description.trim() !== '' ? description : 'No Description'; // Default to 'No Description' if description is left empty
    try {
      //title, description added. ID now in custom GPX tag.
      //previous coordinate items:
        // userLocation.latitude
        // userLocation.longitude
      await addWaypointToGPX(currentGPXPath, waypointLat, waypointLon, waypointRating, waypointId, title, description);
      await addWaypointToGPX(GPX_FILE_PATH, waypointLat, waypointLon, waypointRating, waypointId, title, description);
      setWaypoints(prevWaypoints => [...prevWaypoints, {
        id: waypointId,
        latitude: waypointLat,
        longitude: waypointLon,
        name: title,
        description: description,
        rating: waypointRating
      }]);
      showMessage({
        message: `${rating === 3 ? "Good" : "Bad"} Waypoint Added!`,
        type: "success",
        backgroundColor: "#2196f3", 
        duration: 3000
      });
    } catch (err) {
      console.error(err);
      showMessage({
        message: "Could not add new waypoint",
        description: err.message,
        type: "error",
        duration: 3000
      });
    } finally {
      setModalVisible(false);
    }
  };
  
  //locks for recording route -> camera add to route
  const lockDir = `${FileSystem.documentDirectory}${recordActiveDir}`;
  const lockFile = `${FileSystem.documentDirectory}${recordActiveFile}`;
  const addLock = async () => {
    let lockData = currentGPXPath + " " + Date.now().toString(); //TODO add gpx target file
    let lockDirCheck = await FileSystem.getInfoAsync(lockDir);
    if (!lockDirCheck.exists) await FileSystem.makeDirectoryAsync(lockDir);
    FileSystem.writeAsStringAsync(lockFile, lockData);
  }
  const clearLock = async () => {
    let lockInfo = await FileSystem.getInfoAsync(lockFile);
    if (lockInfo.exists) {
      let lockContents = await FileSystem.readAsStringAsync(lockFile);
      let lockData = "Route recording lock: lockContents\n" + lockContents;
      console.log(lockData);
      FileSystem.deleteAsync(lockFile);
    } else {
      console.log("Did not have to delete lock for recording route (app was not last closed while recording route)");
    }
  }
  //clear lock file on app and ending route, in case app crashed while recording route
  useEffect(() => {
    if (isCycling) addLock();
    else clearLock();
  }, [isCycling]);

  //function handling image data passed from camera
  const extractWaypointFromNewPhoto = async (photo) => {
    const waypointId = Date.now().toString();
    let inLat = photo.LocationInfo.latitude;
    let inLon = photo.LocationInfo.longitude;
    //console.log(inLat);
    //console.log(inLon);

    setWaypointLat(inLat);
    setWaypointLon(inLon);
    setWaypointRating(2);
    setModalVisible(true);
    
    // await addWaypointToGPX(currentGPXPath, inLat, inLon, 2, waypointId);
    // setWaypoints(prevWaypoints => [...prevWaypoints, {
    //   id: waypointId,
    //   latitude: inLat,
    //   longitude: inLon,
    //   name: "Image Waypoint",
    //   description: "Image Waypoint",
    //   rating: 2
    // }]);
    navigation.setParams({ waypointPhoto: null, waypointDesc: null }); // Reset the parameter
  };

  //handle images passed from CaptureImageDrawer.js
  useEffect(() => {
    if (route.params?.waypointPhoto) {
      //console.log(route.params.waypointPhoto)
      extractWaypointFromNewPhoto(route.params.waypointPhoto);
    }
  }, [route.params?.waypointPhoto]);
 
  // const goodMarkerPress = async () => {
  //   const waypointId = Date.now().toString(); // Generate a unique ID for the waypoint
  //   try {
  //       await addWaypointToGPX(currentGPXPath, userLocation.latitude, userLocation.longitude, 3, waypointId);
  //       await addWaypointToGPX(GPX_FILE_PATH, userLocation.latitude, userLocation.longitude, 3, waypointId);
  //       setWaypoints(prevWaypoints => [...prevWaypoints, {
  //           id: waypointId,
  //           latitude: userLocation.latitude,
  //           longitude: userLocation.longitude,
  //           name: "Good Waypoint",
  //           rating: 3
  //       }]);
  //       showMessage({
  //           message: "Good Waypoint Added!",
  //           type: "success",
  //           backgroundColor: "#2196f3",
  //           duration: 3000
  //       });
  //   } catch (err) {
  //       showMessage({
  //           message: "Could not add new waypoint",
  //           description: err.message,
  //           type: "error",
  //           duration: 3000
  //       });
  //   }
  // };

  // const badMarkerPress = async () => {
  //   const waypointId = Date.now().toString(); // Generate a unique ID for the waypoint
  //   try {
  //       await addWaypointToGPX(currentGPXPath, userLocation.latitude, userLocation.longitude, 1, waypointId);
  //       await addWaypointToGPX(GPX_FILE_PATH, userLocation.latitude, userLocation.longitude, 1, waypointId);
  //       setWaypoints(prevWaypoints => [...prevWaypoints, {
  //           id: waypointId,
  //           latitude: userLocation.latitude,
  //           longitude: userLocation.longitude,
  //           name: "Bad Waypoint",
  //           rating: 1
  //       }]);
  //       showMessage({
  //           message: "Bad Waypoint Added!",
  //           type: "success",
  //           backgroundColor: "#2196f3",
  //           duration: 3000
  //       });
  //   } catch (err) {
  //     console.log(err); // Handle the error 
  //   }
  // };

  //gesture navigation items
  const navigateUp = () => {
    navigation.navigate("Camera Waypoint");
  }
  const navigateDown = () => {
    if (!isCycling) navigation.navigate("User Info");
  }
  const navUp = Gesture.Fling()
    .direction(Directions.UP)
    .numberOfPointers(2)
    .onEnd(() => {
      console.log("NavUp");
      runOnJS(navigateUp)();//NOTE: this method is needed to wrap all navigation actions if called by Gesture handlers
    });
  const navDown = Gesture.Fling()
    .direction(Directions.DOWN)
    .numberOfPointers(2)
    .onEnd(() => {
      console.log("NavDown");
      runOnJS(navigateDown)();
    });
  const twoFlingNav = Gesture.Exclusive(navUp, navDown);
  //NOTE: currently, the mapview's gesture controls override any attempt to wrap the system with usable controls
    
  //Importing the GPX File
  const importGPXFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/gpx+xml' });
      
      if (result.canceled) {
        //console.log('Document Picker operation was canceled');
        
        showMessage({
          message: "Operation Canceled",
          description: "The document picker operation was canceled.",
          hideOnPress: true,
          type: "info",
          duration: 3000 
        });
        return;
      }
  
      if (result.assets && result.assets.length > 0) {
        const { uri } = result.assets[0];
        const fileContent = await FileSystem.readAsStringAsync(uri);
  
        // Extracting waypoints
        const waypointRegex = /<wpt lat="([-.\d]+)" lon="([-.\d]+)".*?<name>([^<]+)<\/name>(?:.*?<rating>(\d)<\/rating>)?/gs;
        const matches = Array.from(fileContent.matchAll(waypointRegex));
        const newWaypoints = matches.map((match, index) => ({
            id: index.toString(),
            latitude: parseFloat(match[1]),
            longitude: parseFloat(match[2]),
            name: match[3] || 'Unnamed Waypoint',
            rating: match[4] ? parseInt(match[4]) : 2
          }));
  
        // Extracting routes
        const routeRegex = /<rtept[^>]*lat="([-.\d]+)"[^>]*lon="([-.\d]+)"[^>]*>/g;
        const routeMatches = Array.from(fileContent.matchAll(routeRegex));
        const newRoutes = routeMatches.map(match => ({
          latitude: parseFloat(match[1]),
          longitude: parseFloat(match[2]),
        }));
        
        //Set Functions
        setWaypoints(newWaypoints);
        setRoutes(newRoutes);
        setImported(true);

        if (newRoutes.length > 0) {
            const startCoordinate = newRoutes[0];
            mapRef.current.animateToRegion({
              latitude: startCoordinate.latitude,
              longitude: startCoordinate.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
        }
      }
    } catch (error) {
      //console.error('Error importing GPX file:', error);
      
      showMessage({
        message: "Error importing GPX file",
        description: "Check the file you are trying to import, and try again.",
        hideOnPress: true,
        type: "error",
        duration: 3000 
      });
    }
  };

  const importGPXFileFromPath = async (filename) => {
    try {
      // File is in the document directory
      const fullPath = filename.startsWith('file://') ? filename : FileSystem.documentDirectory + filename;
      //console.log('Attempting to import GPX file from path:', fullPath);
  
      // Check if the file exists at the given path
      const fileInfo = await FileSystem.getInfoAsync(fullPath);
      if (!fileInfo.exists) {
        console.error('File does not exist at path:', fullPath);
        return;
      }
  
      // Read the file content
      const fileContent = await FileSystem.readAsStringAsync(fullPath);
  
      // Extracting waypoints
      const waypointRegex = /<wpt lat="([-.\d]+)" lon="([-.\d]+)".*?>\s*(?:<name>([^<]*)<\/name>)?\s*(?:<desc>([^<]*)<\/desc>)?\s*(?:<rating>(\d)<\/rating>)?\s*(?:<id>(\d+)<\/id>)?\s*<\/wpt>/gs;
      const matches = Array.from(fileContent.matchAll(waypointRegex));
      const newWaypoints = matches.map((match, index) => ({
        id: match[6] || index.toString(),
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[2]),
        name: match[3] || '',
        desc: match[4] || '',
        rating: match[5] ? parseInt(match[5]) : undefined,
      }));
    
  
      // Extracting routes
      const routeRegex = /<rtept[^>]*lat="([-.\d]+)"[^>]*lon="([-.\d]+)"[^>]*>/g;
      const routeMatches = Array.from(fileContent.matchAll(routeRegex));
      const newRoutes = routeMatches.map(match => ({
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[2]),
      }));

      /* To check if newWaypoints and newRoutes are extracted correctly and 
        state setters like setImportedWaypoints and setImportedRoutes 
        are called with the correct data.
      */
        // console.log("Extracted Waypoints: ", newWaypoints);
        // console.log("Extracted Routes: ", newRoutes);
  
      setImportedWaypoints(newWaypoints);
      setImportedRoutes(newRoutes);
      setImported(true);

      if (newWaypoints.length > 0) {
        mapRef.current.fitToCoordinates(newWaypoints.map(wp => ({
          latitude: wp.latitude,
          longitude: wp.longitude,
        })), {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: true,
        });
      }
    } catch (error) {
      console.error('Error importing GPX file:', error);
      showMessage({
        message: "Error importing GPX file",
        description: "Check the file you are trying to import, and try again.",
        hideOnPress: true,
        type: "error",
        duration: 30000
      });
    }
  };

  //orientation lock
  useEffect(() => {
    ScreenOrient.lockAsync(ScreenOrient.OrientationLock.PORTRAIT_UP);
  }, []);//TODO modify this setup to only lock on specific windows; this seems to activate it on the entire app
  
  //PHOTO WAYPOINTS FILE
  const photosFilename = `${FileSystem.documentDirectory}${photoWaypointsFile}`;
  const photosDirectory = `${FileSystem.documentDirectory}${photoLocalStore}`;
  
  //Startup of photos waypoint file from storage; create if it does not exist yet
  const photoWaypointsSetup = async () => {
    const fileInfo = await FileSystem.getInfoAsync(photosFilename);
    //console.log(fileInfo);
    const storageInfo = await FileSystem.getInfoAsync(photosDirectory);
    //console.log(storageInfo);

    if (!storageInfo.exists) {
      console.log("Image storage folder missing; recreating.");
      //create folder for images
      await FileSystem.makeDirectoryAsync(photosDirectory, { intermediates : true });
    }
    if (!fileInfo.exists) {
      console.log("GPX waypoints file missing; recreating.");
      await clearPhotoWaypoints();
      await deleteAllImportedPhotos();//useful DEBUG action of clearing photos folder on deleting the associated waypoints
      //TODO ^ should not be present if images are associated with waypoints in routes; this is yet to be implemented
    }

    //below is deprecated due to not storing image import GPX data anymore, but may still be useful for future functions
    //load the photo GPX file's contents using setPhotoGPXdata
    let photosData = await FileSystem.readAsStringAsync(photosFilename);
    var dataLines = photosData.split("\n").filter((word)=>{
      let expectedWpt = word.trim();
      return expectedWpt.startsWith("<wpt") && !expectedWpt.includes("undefined");
    });
    setPhotoGPXdata(dataLines);
    //console.log("Photos data successfully retrieved or created.");
  }

  useEffect(() => {
    photoWaypointsSetup();
  }, []);

  //Function called when photos waypoints are modified
  const addPhotoWaypointImport = async () => {
    let selectedImage = await pickImage();
    if (selectedImage != null) {
      //check photos directory and create an appropriate name for the locally stored copy
      let photoList = await FileSystem.readDirectoryAsync(photosDirectory);
      //console.log(photoList);
      let imageNameSplit = selectedImage.uri.split(".");
      let photoNum = photoList.length;
      let photoName = "importedImage" + photoNum + "." + imageNameSplit[imageNameSplit.length - 1];
      //console.log(photoName);
      
      //copy photo to app local storage
      await FileSystem.copyAsync({
        from: selectedImage.uri,
        to: `${photosDirectory}${photoName}`,
      });

      //save coordinate data to imported images GPX file
      let inLat = selectedImage.exif.GPSLatitude *
        (selectedImage.exif.GPSLatitudeRef=="S" ? -1 : 1);
      let inLon = selectedImage.exif.GPSLongitude *
        (selectedImage.exif.GPSLongitudeRef=="W" ? -1 : 1);
      await addWaypointToGPX(photosFilename, inLat, inLon, 2, Date.now().toString(), photoName);

      //center map on location extracted from image
      mapRef.current.animateToRegion({
        latitude: inLat,
        longitude: inLon
      }, 1);

      //reset internal collection of waypoints
      photoWaypointsSetup();
    } else {
      console.log("Error importing the image.");
    }
  }

  //Function called when photos waypoints are deleted
  const deletePhotoWaypoint = async () => {
    //TODO figure out how waypoint input selection
    //remove from photos waypoint GPX file
    //remove copy of photo used from app local storage
  }

  const clearPhotoWaypoints = async () => {
    const initialContent =
`<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="CyclingMarker">
</gpx>`;
    //create new GPX contents in local storage and save it
    await FileSystem.writeAsStringAsync(photosFilename, initialContent);
  }

  const shareWaypointPhoto = async () => {
    //TOOD figure out waypoint input selection
    //do FileShare API on photo in app local storage

    //Note: see Task 225 for issues with saving waypoint photo data and examine carefully 
  }

  const startRoute = async () => {
    // Check if a main GPX file exists; if not, create a new one.
    const gpxExists = await doesGPXFileExist();
    if (!gpxExists) {
      await createInitGPX();
    }
    setWaypoints([]);
  
    // Ensure the user has granted location permissions.
    if (!hasLocationPermission) {
      Alert.alert(
        "Location Permission Required",
        "You do not have the proper location permissions set. Please check your settings.",
        [{ text: "OK" }]
      );
      return;
    }

    // Check if there is an imported route
    // If no route has been imported, confirm with the user to start a new route.
    if (!imported) {
      Alert.alert(
        'Start Route',
        'Do you want to start cycling without a route?',
        [
          {
            text: 'OK',
            onPress: async () => {
              setIsCycling(true); // Start cycling  
              await initiateRoute();           
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    } else {
      // If a route has been imported, use the existing logic to check the distance to the start point of the route
      // and proceed with the confirmation to start the route
      const startPoint = importedRoutes[0];
  
      // Ensure startPoint and userLocation are available
      if (startPoint && userLocation) {
        const { latitude: userLat, longitude: userLon } = userLocation;
        const distance = getDistanceFromLatLonInMiles(userLat, userLon, startPoint.latitude, startPoint.longitude);
  
        if (distance > 3) {
          Alert.alert("Too Far", "You are too far from the start of the route.");
          return;
        }
  
        Alert.alert(
          'Start Route',
          'Would you like to begin Cycling?',
          [
            {
              text: 'START',
              onPress: () => initiateRoute(),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
          { cancelable: true }
        );
      } else {
        showMessage({
          message: "No Valid Routes",
          description: "There are no valid routes in the imported route.",
          hideOnPress: true,
          type: "error",
          duration: 5000
        });
      }
    }
  };

  // Function to initiate the route
  const initiateRoute = async () => {
    setIsCycling(true);
    startTimer();

    //Clear any existing data
    setRoutes([]);
    setWaypoints([]);

// //183 previous; delete if debugging shows no issues
//     if (!currentGPXPath) {
//       const newFilePath = await createNewGPXFile();
//       setCurrentGPXPath(newFilePath);

      // Create a route in the global GPX file and the instance-based GPX file
      // const routeIdGlobal = await addTrackToGPX(GPX_FILE_PATH);//TODO US228
      // const routeIdInstance = await addTrackToGPX(newFilePath);//TODO US228
      // setCurrentRoute({global: routeIdGlobal, instance: routeIdInstance});
//       // Create a route in the global GPX file and the instance-based GPX file
//       const routeIdGlobal = await addRouteToGPX(GPX_FILE_PATH);
//       const routeIdInstance = await addRouteToGPX(newFilePath);
//       setCurrentRoute({global: routeIdGlobal, instance: routeIdInstance});
//     }
    // Reset the lastPointRef
    lastPointRef.current = null;

    //This seems to cause issues on IOS
    //const fileInfo = await FileSystem.getInfoAsync(currentGPXPath);
    //const currentExists = fileInfo.exists;

    //Check if there is a current GPX file and if it exists
    if (!currentGPXPath) {
      console.log('Creating a new GPX file');
      const newFilePath = await createNewGPXFile();
      setCurrentGPXPath(newFilePath);

      if (userLocation && userLocation.latitude && userLocation.longitude) {
        // Create a route in the global GPX file and the instance-based GPX file
        const routeIdGlobal = await addTrackToGPX(GPX_FILE_PATH, userLocation);
        // log below clarifies which GPX file the ID belongs to.
        //console.log(`Global Route ID: ${routeIdGlobal}`); 
        if (!routeIdGlobal) {
          console.error('Failed to create route in the main GPX file');
        }
        const routeIdInstance = await addTrackToGPX(newFilePath, userLocation);
        //// log below clarifies which GPX file the ID belongs to.
        //console.log(`Instance Route ID: ${routeIdInstance}`);
        setCurrentRoute({global: routeIdGlobal, instance: routeIdInstance});
      } else {
        console.log('User location is not available.');
      }
    } else {
      console.log('currentGPX already exists:', currentGPXPath);
    }

    //Prevent the phone from sleeping while active
    activateKeepAwakeAsync();

    showMessage({
      message: "Route Started!",
      hideOnPress: true,
      type: "info",
      duration: 3000 
    });
  };
  
  useEffect(() => {
    return () => {
      setWaypoints([]);
      stopTimer();
    };
  }, []);

  // const addRoutePoint = async (routeIds) => {
  //   const currentLocation = userLocationRef.current;
  //   if (currentLocation) {
  //     const point = {
  //       latitude: currentLocation.latitude,
  //       longitude: currentLocation.longitude,
  //       name: new Date().toLocaleTimeString(),
  //       dateTime: true
  //     };  

  //     const lastPoint = routes[routes.length - 1];
  //     if(lastPoint){
  //       /*console.log('POINT INFO \n--------------\n' 
  //       + 'Last Point info: ' + '\nname: ' + lastPoint.name + '\nlat: ' + lastPoint.latitude + 'lon: ' + lastPoint.longitude 
  //       + '\n\nCurrent Point info: ' + '\nname: ' + point.name + '\nlat: ' + point.latitude + 'lon: ' + point.longitude 
  //       + '\n--------------\n');
  //       */
  //       //console.log('Last Point info: ' + '\nname: ' + lastPoint.name + '\nlat: ' + lastPoint.latitude + 'lon: ' + lastPoint.longitude);
  //       //console.log('Current Point info: ' + '\nname: ' + point.name + '\nlat: ' + point.latitude + 'lon: ' + point.longitude);
  //       //console.log('\n--------------\n');
  //     }
  //     console
  //     if (lastPoint && lastPoint.latitude === point.latitude && lastPoint.longitude === point.longitude) {
  //       //console.log('New route point is the same as the last one. Skipping addition.');
  //       return; 
  //     }
    
  //     try {
  //       // Add route point to both GPX files
  //       let globalAdd = await addTrackPointToGPX(GPX_FILE_PATH, routeIds.global, point);//TODO US228
  //       let instanceAdd = await addTrackPointToGPX(currentGPXPath, routeIds.instance, point);//TODO US228
  //       setRoutes(prevRoutes => [...prevRoutes, point]);
  //       //console.log('Route Point added to both GPX files. Point info: ' + JSON.stringify(point));
  //     } catch (error) {
  //       console.error('Error adding route point to GPX:', error);
  //     }

  const lastPointRef = useRef();
  const addRoutePoint = async () => {
    const currentLocation = userLocationRef.current;
    if (currentLocation) {
      const point = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        name: new Date().toLocaleTimeString(),
        dateTime: true
      };

      const lastPoint = lastPointRef.current;
      if (lastPoint && lastPoint.latitude === point.latitude && lastPoint.longitude === point.longitude) {
        console.log('New route point is the same as the last one. Skipping addition.');
        return;
      }

      lastPointRef.current = point; // Update the ref with the new point

      try {
        if (typeof currentRoute === 'object' && currentRoute.global && currentRoute.instance) {
          let globalAdd = await addTrackPointToGPX(GPX_FILE_PATH, currentRoute.global, point);
          let instanceAdd = await addTrackPointToGPX(currentGPXPath, currentRoute.instance, point);
          console.log(`Global trackpoint add: ${globalAdd}`);
          console.log(`Instance trackpoint add: ${instanceAdd}`);
          setRoutes(prevRoutes => [...prevRoutes, point]); // Update routes state
        } else {
          let instanceAdd = await addTrackPointToGPX(currentGPXPath, currentRoute, point);
          console.log(`Instance trackpoint add: ${instanceAdd}`);
        }
        console.log('Track point added to both GPX files. Point info: ' + JSON.stringify(point));
      } catch (error) {
        console.error('Error adding track point to GPX:', error);
        showMessage({
          message: "Error adding route point to GPX File",
          description: "There could be an issue with the GPX file.",
          hideOnPress: true,
          type: "error",
          duration: 30000
        });
      }
    }
  };

  const handleWaypointDelete = async (waypointId) => {
    if(!isCycling) return;
    Alert.alert(
      "Delete Waypoint",
      "Are you sure you want to delete this waypoint?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes", 
          onPress: async () => {
            setWaypoints(prevWaypoints => prevWaypoints.filter(wp => wp.id !== waypointId));
            console.log("Waypoint ID to be deleted: " + waypointId);
            try {
              await deleteWaypointFromGPX(GPX_FILE_PATH, waypointId);
              await deleteWaypointFromGPX(currentGPXPath, waypointId);
              console.log("Waypoint deleted: " + waypointId);
            } catch (error) {
              console.error("Error deleting the waypoint: " + waypointId + ": " + error);
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    let interval;
    if (isCycling && currentRoute) {
      interval = setInterval(() => {
        const point = {
          latitude: userLocationRef.current.latitude,
          longitude: userLocationRef.current.longitude,
          name: new Date().toLocaleTimeString(),
          dateTime: true
        };
        addRoutePoint();
      }, 3000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isCycling, currentRoute, userLocationRef]);
  
  //Clear imported route onPress function with confirmation
  const clearRoute = () => {
    Alert.alert(
      "Clear Map",
      "Are you sure you want to clear the route?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { text: "Yes", onPress: () => handleClearRoute() }
      ],
      { cancelable: false }
    );
  };

  // Actual function to clear the route
  const handleClearRoute = () => {

    setRoutes([]);
    setWaypoints([]);

    setImportedWaypoints([]); 
    setImportedRoutes([]); 
    setImported(false); 
  };

  //Seperated Rendering Components --------------------------------

  //Loading Screen Component
  const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.loadingText}>Gathering user location data . . .</Text>
    </View>
  );

  //Clear Route Button Component
  const ClearRouteButton = ({ onPress }) => {
    return (
      <TouchableOpacity
        style={{
          position: 'absolute',
          left: 15,
          bottom: 35,
          backgroundColor: '#007aff',
          padding: 10,
          borderRadius: 5,
          zIndex: 1
        }}
        onPress={onPress}
      >
        <Text style={{ color: 'white' }}>Clear Route</Text>
      </TouchableOpacity>
    );
  };

  //Route Timer Component
  const TimerComponent = ({ isCycling, elapsedTime }) => {
    if (!isCycling) return null;

    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return (
      <View style={{
        position: 'absolute',
        top: 50,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 10,
        zIndex: 1,
        width: screenWidth - 150
      }}>
        <Text style={{
          fontSize: 36,
          color: 'white',
          textAlign: 'center'
        }}>
          {formattedTime}
        </Text>
      </View>
    );
  };

  //Main Menu Expanding Button Component
  const SubMenuComponent = ({ isCycling, isMenuOpen, startRoute, importGPXFile, setMenuOpen }) => {
    if (isCycling || !isMapReady) return null;
    return (
      <View style={styles.buttonContainer}>
        {isMenuOpen && (
          <View style={styles.subMenuContainer}>
            <View style={styles.subMenuContainer}>
              <TouchableOpacity 
                style={styles.customButton} 
                onPress={startRoute} 
              >
                <Text style={styles.buttonText}>Start Route</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customButton}
                onPress={addPhotoWaypointImport}
              >
                <Text style={styles.buttonText}>Import Image</Text>
              </TouchableOpacity>
              {/*
                <TouchableOpacity style={styles.customButton} onPress={importGPXFile}>
                  <Text style={styles.buttonText}>Import GPX File</Text>
                </TouchableOpacity>
              */}
            </View>
          </View>
        )}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuOpen(!isMenuOpen)}
        >
          <Text style={[
            styles.menuButtonText, 
            { lineHeight: isMenuOpen ? 40 : 50 } 
          ]}>
            {isMenuOpen ? 'x' : '+'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  //Active Route View and Buttons
  const RouteActionsComponent = ({ isCycling, goodMarkerPress, badMarkerPress, stopRouteFunc, camNav }) => {
    if (!isCycling) return null;

    return (
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.customButton, { alignSelf: 'right', marginTop: 10, width: '35%'}]} 
          onPress={camNav} 
        >
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <TouchableOpacity
            style={[styles.customLargeButton, { backgroundColor: 'green', flex: 1, marginRight: 5 }]}
            onPress={goodMarkerPress}
          >
            <Text style={styles.buttonText}>Good</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.customLargeButton, { backgroundColor: 'red', flex: 1, marginLeft: 5 }]}
            onPress={badMarkerPress}
          >
            <Text style={styles.buttonText}>Bad</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.customButton, { marginTop: 10, width: '100%'}]} 
          onPress={stopRouteFunc} 
        >
          <Text style={styles.buttonText}>Stop Route</Text>
        </TouchableOpacity>
      </View>
    );
  };

  //iOS additional map control functions & buttons (Android/Google maps contains these on the screen automatically; Apple maps does not have this feature)
  const regionZoomCopy = (regionData, zoomAction = 0) => {
    var newRegion = {
      latitude: regionData.latitude,
      longitude: regionData.longitude,
      latitudeDelta: regionData.latitudeDelta,
      longitudeDelta: regionData.longitudeDelta
    };
    if (zoomAction == 1) {//zoom in
      newRegion.latitudeDelta = newRegion.latitudeDelta / zoomScalar;
      newRegion.longitudeDelta = newRegion.longitudeDelta / zoomScalar;
    }
    if (zoomAction == 2) {//zoom out
      newRegion.latitudeDelta = newRegion.latitudeDelta * zoomScalar;
      newRegion.longitudeDelta = newRegion.longitudeDelta * zoomScalar;
    }
    return newRegion;
  }
  const centerOnUserLocation = () => {
    //console.log("center on user");
    //console.log(userLocation);
    //console.log(mapRef.current);
    mapRef.current.animateToRegion(userLocation, 1);
  }
  const iosZoomIn = () => {
    //console.log("zoom in");
    //console.log(mapRegion);
    var newRegion = regionZoomCopy(mapRegion, 1);
    mapRef.current.animateToRegion(newRegion, 1);
  }
  const iosZoomOut = () => {
    //console.log("zoom out");
    var newRegion = regionZoomCopy(mapRegion, 2);
    mapRef.current.animateToRegion(newRegion, 1);
  }
  const IOSMapControlComponent = ({isCycling}) => {
    return (
      <View style={styles.iosControlContainer}>
        {isCycling ? (null) : (
        <TouchableOpacity
          style={[styles.customButton, { backgroundColor: 'blue', flex: 1, marginLeft: 5, marginRight: 5, width: 50, height: 50 }]}
          onPress={centerOnUserLocation}>
          <Text style={styles.buttonText}>C</Text>
        </TouchableOpacity>)}
        <TouchableOpacity
          style={[styles.customButton, { backgroundColor: 'blue', flex: 1, marginLeft: 5, marginRight: 5, width: 50, height: 50 }]}
          onPress={iosZoomIn}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.customButton, { backgroundColor: 'blue', flex: 1, marginLeft: 5, marginRight: 5, width: 50, height: 50 }]}
          onPress={iosZoomOut}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
      </View>
    );
  }

  //Actual Rendering Function
  return (
    <GestureDetector gesture={twoFlingNav}><View style={styles.container}>
      <TimerComponent isCycling={isCycling} elapsedTime={elapsedTime} />
      <WaypointModal
        isVisible={modalVisible}
        onConfirm={(title, description) => handleAddWaypoint(title, description, waypointRating)}
        onCancel={() => setModalVisible(false)}
      />
      {/*Map Component. Could not be seperated due to constant refreshing issue*/}
      {isMapReady ? (
      <MapView
        ref={mapRef} 
        style={styles.map}
        initialRegion={{
          latitude: waypoints[0]?.latitude || 37.78825,
          longitude: waypoints[0]?.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        provider={PROVIDER_GOOGLE}
        scrollDuringRotateOrZoomEnabled={false}
        mapPitch={0}
        mapRotation={mapRotation}
        onRegionChangeComplete={(region) => {
          setMapRegion(region);
          setMapRotation(region.heading);
        }}
        showsUserLocation={true}
        showsCompass={true}
        onMapReady={onMapReady}
        pitchEnabled={false}
      >
          {/* 
          Outputs the current values of routes, importedRoutes, waypoints, and importedWaypoints 
          right before they are passed to render the map elements

          {console.log('Rendering Routes:', routes)}
          {console.log('Rendering Imported Routes:', importedRoutes)}
          {console.log('Rendering Waypoints:', waypoints)}
          {console.log('Rendering Imported Waypoints:', importedWaypoints)}
           */}

         {importedRoutes.length > 0 && (
          <Polyline
            coordinates={importedRoutes.map(route => ({
              latitude: parseFloat(route.latitude),
              longitude: parseFloat(route.longitude),
            }))}
            strokeColor="#808080" // Gray color
            strokeWidth={5}
            lineDashPattern={[2,5]} //Dash pattern
          />
        )}

        {routes.length > 0 && (
          <Polyline
            coordinates={[
              ...routes.map(route => ({
                latitude: parseFloat(route.latitude),
                longitude: parseFloat(route.longitude),
              })),
              userLocation && isCycling ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : null,
            ].filter(Boolean)}
            strokeColor="#000"
            strokeWidth={5}
          />
        )}

        {waypoints.map((waypoint) => {
            let pinColor = "linen";  
            if (waypoint.rating === 1) pinColor = "red"; //
            else if (waypoint.rating === 3) pinColor = "green";

            return (
                <Marker
                    key={waypoint.id}
                    coordinate={{ latitude: waypoint.latitude, longitude: waypoint.longitude }}
                    title={waypoint.name}
                    pinColor={pinColor}
                    onPress={() => handleWaypointDelete(waypoint.id)}
                />
            );
        })}

        {importedWaypoints.map((waypoint) => {
            let pinColor = "linen";  
            if (waypoint.rating === 1) pinColor = "red"; //
            else if (waypoint.rating === 3) pinColor = "green";

            return (
                <Marker
                    key={waypoint.id}
                    coordinate={{ latitude: waypoint.latitude, longitude: waypoint.longitude }}
                    title={waypoint.name}
                    pinColor={pinColor}
                    onPress={() => handleWaypointDelete(waypoint.id)}
                />
            );
        })}
            
        {importedRoutes.length > 0 && (
          <>
            <Marker
              coordinate={importedRoutes[0]}
              title="Start"
              pinColor="lightblue"
            />
            {imported && (
              <Marker
                coordinate={importedRoutes[importedRoutes.length - 1]}
                title="End"
                pinColor="lightblue"
              />
            )}
          </>
        )}
      </MapView>
      ) : (
        <LoadingScreen />
      )}
      {/*End of Map Component.*/}
      {/*In-Route Zoom Toggle */}
      {isCycling && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            right: 12, 
            top: 60,
            width: 40,
            height: 40,
            justifyContent: 'center', 
            alignItems: 'center', 
            backgroundColor: '#007aff',
            borderRadius: 30,
            padding: 0,
            zIndex: 2, // Make it above map
          }}
          onPress={() => {
            setIsZoomedIn(!isZoomedIn); // Toggle the zoom state
            const newZoom = isZoomedIn ? zoomLevels.zoomedOut : zoomLevels.zoomedIn; 
            // Update map region 
            const newRegion = {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              ...newZoom,
            };
            mapRef.current.animateToRegion(newRegion, 1000);
          }}
        >
          <Image 
            source={isZoomedIn ? zoomOutIcon : zoomInIcon} 
            style={{ width: 24, height: 24 }} 
          />
        </TouchableOpacity>
      )}
      {imported && !isCycling && <ClearRouteButton onPress={clearRoute} />}
      {(Platform.OS === 'ios') ? (<IOSMapControlComponent isCycling={isCycling}/>) : (<></>)}
      <SubMenuComponent
        isCycling={isCycling}
        isMenuOpen={isMenuOpen}
        startRoute={startRoute}
        importGPXFile={importGPXFile}
        setMenuOpen={setMenuOpen}
      />
      <RouteActionsComponent
        isCycling={isCycling}
        goodMarkerPress={goodMarkerPress}
        badMarkerPress={badMarkerPress}
        stopRouteFunc={confirmStopRoute}
        camNav={navigateUp}
      />
      <GPXNameModal
        isVisible={gpxNameModalVisible}
        onConfirm={handleGPXNameConfirm}
        onCancel={() => setGpxNameModalVisible(false)}
      />

      <FlashMessage position="top" />
    </View></GestureDetector>
  );
}

export default GPXWaypoints;
