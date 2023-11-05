import React, { useState, useRef, useEffect } from 'react';
import { Button, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Camera, CameraType } from 'expo-camera';

const CaptureImageDrawer = () => {
  Camera.getCameraPermissionsAsync();
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }
  const captureImage = async () => {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync({
        exif:true,
        additionalExif:{LocationInfo:"Must be added with additional code; camera API lacks it"}
        //TODO in the future, this needs to integrate location data in order to capture location info
        //Currently, the API intentionally excludes GPS data due to system limits & simplicity/privacy concerns
        //write it in using additionalExif:{_data_} here
      });
      console.log(photo);
    } else {
      console.log("No camera is active!");
    }
  }

  return (
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
    </View>
  );
}

const styles = StyleSheet.create({
  button:{
    backgroundColor: '#007aff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10
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
    color: 'white',
    textAlign: 'center'
  },
  container:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 

export default CaptureImageDrawer;