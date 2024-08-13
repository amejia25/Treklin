import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { Gesture, GestureDetector, Directions } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';

import { recordActiveFile } from './GPXWaypoints'; 

const CaptureImageDrawer = ({ navigation }) => {
  //Camera state
  const [type, setType] = useState(CameraType.back);
  //Data state
  const [photo, setPhoto] = useState();
  const [isRecording, setIsRecord] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  //Permissions state
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);

  //Get permissions set up and update user location in real-time
  useEffect(() => {
    let locationSubscription;
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
      const locationPermission = await Location.getForegroundPermissionsAsync();
      setHasLocationPermission(locationPermission.status === "granted");

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 2000,
          distanceInterval: 10,
        },
        (newLocation) => {
          const userLoc = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          setUserLocation(userLoc);
        }
      );
    })();
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  //state for recording
  const getRecordState = async () => {
    let lockInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}${recordActiveFile}`);
    setIsRecord(lockInfo.exists);
    //console.log(lockInfo.exists);
  }
  useEffect(() => {
    getRecordState();
  }, [photo]);

  //gesture navigation items
  const navigateUp = () => {
    navigation.navigate("GPX Files");
  }
  const navigateDown = (passPhoto = undefined) => {
    if (passPhoto !== undefined) navigation.navigate("Home", passPhoto);
    else navigation.navigate("Home");
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

  //constants for button actions
  const toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }
  const captureImage = async () => {
    if (this.camera) {
      let image = await this.camera.takePictureAsync({
        exif:true,
        additionalExif:{LocationInfo : userLocation}
      });
      console.log(image);
      setPhoto(image);
    }
  }
  const saveWaypoint = async () => {
    if (!photo) return;
    let bundle = {waypointPhoto: photo.exif, waypointDesc: photo.uri};
    //await savePhoto();
    setPhoto(undefined);
    //console.log(bundle);
    runOnJS(navigateDown(bundle));
  }

  //Note: this function has been removed due to an issue where the photo does not keep location info when saved
  const savePhoto = async () => {
    if (!photo) return;
    MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
      setPhoto(undefined);
    });
  }

  const saveButton = (onSave, saveTarget) => {
    return (
      <TouchableOpacity style={styles.button} onPress={onSave}>
        <Text style={styles.text}>Save {saveTarget}</Text>
      </TouchableOpacity>
    );
  };

  //render returns
  if (hasCameraPermission === undefined ||
      hasLocationPermission === undefined ||
      hasMediaLibraryPermission === undefined) {//Permission request in-progress
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting permissions...</Text>
      </View>
    );
  } else if (!hasCameraPermission) {//No camera permissions
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Permission for camera not granted. This module does not work.</Text>
      </View>
    );
  } else if (!hasLocationPermission) {//No location permissions
    return (
      <View style={styles.container}>
        <Text style={styles.text}>You have no location access. Your device camera app will be more useful than this one.</Text>
      </View>
    )
  } else if (photo) {
    const saveA = ((isRecording === true) ? saveButton(saveWaypoint, "Waypoint") : null);
    //const saveB = saveButton(savePhoto, "Photo");
    return (
      <View style={styles.container}>
        <Image style={styles.preview} source={{ uri: photo.uri }} />
        <View style={styles.buttonContainer}>
          {saveA}
          {/*saveB*/}
          <TouchableOpacity style={styles.button} onPress={() => setPhoto(undefined)}>
            <Text style={styles.text}>Discard Image</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  } else {//Camera view
    const mediaWarning = (
      <Text style={styles.topText}>Media Library Permission not granted; images not saved. Waypoints are still viable.</Text>
    );
    return (
      <GestureDetector gesture={twoFlingNav}>
        <View style={styles.container}>
          <Camera style={styles.camera} ref={(r) => {camera = r}} type={type}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
                <Text style={styles.text}>Flip Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={captureImage}>
                <Text style={styles.text}>Capture</Text>
              </TouchableOpacity>
            </View>
          </Camera>
          {hasMediaLibraryPermission ? null : mediaWarning}
        </View>
      </GestureDetector>
    );
  }
}

const styles = StyleSheet.create({
  button:{
    backgroundColor: '#00abff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    width: 240
  },
  buttonContainer:{
    position: 'absolute',
    bottom: 20,
    right: 10,
    alignItems: 'flex-end'
  },
  camera:{
    flex:1,
    width:"100%"
  },
  text:{
    color: 'black',
    textAlign: 'center'
  },
  topText:{
    color: '#f9f9f9',
    textAlign: 'left',
    position: 'absolute',
    top: 10,
    left: 10
  },
  container:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1
  }
}); 

export default CaptureImageDrawer;