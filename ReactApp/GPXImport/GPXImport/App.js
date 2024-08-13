import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import GPXWaypoints from './GPXWaypoints';
import CaptureImageDrawer from './CaptureImageDrawer';
import GPXFileList from './GPXFileList';
import { UserInfoPanel } from './SettingsAndInfo';
import * as SplashScreen from 'expo-splash-screen';
import { colors, styles } from './styles';
import { Image } from 'react-native';
import 'expo-dev-client';//comment out in preview builds

SplashScreen.preventAutoHideAsync(); //Prevent splash screen from hiding until app is ready

const Drawer = createDrawerNavigator();

export default function App() {
  useEffect(() => {
    async function prepare() {
      try {
      } finally {
        await SplashScreen.hideAsync(); // Hide the splash screen once loading is complete
      }
    }

    prepare();
  }, []);

  return (
<NavigationContainer>
<Drawer.Navigator initialRouteName="Home"
    screenOptions={{
    drawerActiveTintColor: colors.alabaster,  // Sets the text color of the active drawer item
    drawerInactiveTintColor: '#f9f9f9',  // Sets the text color of the inactive drawer items
    drawerActiveBackgroundColor: colors.fernGreen,  // Sets the background color of the active drawer item
    drawerInactiveBackgroundColor: colors.calPolyGreen,  // Sets the background color of the inactive drawer items
    drawerStyle: {
    backgroundColor: colors.calPolyGreen,  // Sets the background color of the whole drawer panel
  },
    drawerLabelStyle: styles.drawerLabel,  // Custom style for the drawer label
    headerStyle: {
    backgroundColor: colors.calPolyGreen,  // Sets the background color of the header
  },
    headerTintColor: '#f9f9f9',  // Sets the color of the header text and icons
    drawerItemStyle: styles.drawerItem,  // Custom style for the drawer items
    drawerPressColor: colors.fernGreen,  // Color for the ripple effect (Android) when a drawer item is pressed
}}

>
  <Drawer.Screen 
    name="Home" 
    component={GPXWaypoints} 
    options={{
      drawerIcon: ({focused, size}) => (
        <Image 
          source={require('./assets/icons/home-map.png')} 
          style={{width: size, height: size}}
        />
      )
    }}
  />
  <Drawer.Screen 
    name="Camera Waypoint" 
    component={CaptureImageDrawer}
    options={{
      drawerIcon: ({focused, size}) => (
        <Image 
          source={require('./assets/icons/camera.png')} 
          style={{width: size, height: size}}
        />
      )
    }}
  />
  <Drawer.Screen 
    name="GPX Files" 
    component={GPXFileList} 
    options={{
      drawerIcon: ({focused, size}) => (
        <Image 
          source={require('./assets/icons/gpx.png')} 
          style={{width: size, height: size}}
        />
      )
    }}
  />
  <Drawer.Screen 
    name="User Info" 
    component={UserInfoPanel} 
    options={{
      drawerIcon: ({focused, size}) => (
        <Image 
          source={require('./assets/icons/user.png')} 
          style={{width: size, height: size}}
        />
      )
    }}
  />
</Drawer.Navigator>
</NavigationContainer>
  );
}
