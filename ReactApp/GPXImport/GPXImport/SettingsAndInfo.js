import React, { useState, useEffect } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, SafeAreaView, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Gesture, GestureDetector, Directions } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { styles } from './styles';

const userInfoDir = `${FileSystem.documentDirectory}userData/`;
const userInfoLoc = `${userInfoDir}userInputData.json`;

const newUserInfo = async () => {
  await FileSystem.makeDirectoryAsync(userInfoDir, { intermediates : true });
  await FileSystem.writeAsStringAsync(userInfoLoc, `{}`);
}

const UserInfoPanel = ({ navigation }) => {
  //State refs
  const [loadedInfo, setLoaded] = useState(false);
  const [storagePerm, setStoragePerm] = useState(true);
  const [storedInfo, setStoredInfo] = useState({});
  const [nameText, setNameText] = useState("");
  const [vehicleText, setVehicleText] = useState("");

  useEffect(() => {
        loadUserInfo();
    //setLoaded(true); //uncomment to view incomplete contents
  }, []);

  /*
  useEffect(() => {
    let userData = {
      name: nameText,
      vehicle: vehicleText
    };
    setStoredInfo(userData);
  }, [nameText, vehicleText]);
  */

  const loadUserInfo = async () => {
    //TODO implement before disabling loading screen in future versions
  }

  const saveUserInfo = async () => {
    if (loadedInfo) {
      console.log("not yet implemented.");
      //TODO
    } else {
      console.log("Data is not yet loaded; operation cancelled.");
      Alert.alert(
        "Loading",
        "Please wait until data is loaded before attempting operations.",
        [{ text: "OK" }]
      );
    }
  }

  useEffect(() => {
    //TODO save storedInfo on changes
    //saveUserInfo();
  }, [storedInfo]);

  //gesture navigation items
  const navigateUp = () => {
    navigation.navigate("Home");
  }
  const navigateDown = () => {
    navigation.navigate("GPX Files");
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

  //return component
  return (
    <GestureDetector gesture={twoFlingNav}>
      <SafeAreaView style={styles.container}>
        {loadedInfo ?
        (storagePerm ?
        (<View style={{flexDirection : 'column', padding: 10}}>
          <TextInput style={styles.inputText} value={nameText} onChangeText={setNameText} placeholder='Name'></TextInput>
          <TextInput style={styles.inputText} value={vehicleText} onChangeText={setVehicleText} placeholder='Vehicle'></TextInput>
        </View>) :
        (<Text style={styles.loadingText}>This app does not have file permissions; user info cannot be saved.</Text>)) :
        (<Text style={styles.loadingText}>Loading User Info...</Text>)}
        <TouchableOpacity style={styles.customButton} onPress={saveUserInfo}>
          <Text styles={styles.buttonContainer}>Save</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </GestureDetector>
  );
}

export { UserInfoPanel };