import {StyleSheet} from 'react-native';

export const colors = {
  darkGreen: '#132A13',
  calPolyGreen: '#255325',
  fernGreen: '#48763A',
  mossGreen: '#849C64',
  sage: '#C0C28D',
  pearl: '#D3D5B5',
  alabaster: '#E5E7DC',
};

export const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    subMenuContainer: {
      marginBottom: 5,
    },
    optionButton: {
      marginBottom: 10,
    },
    menuButton: {
      backgroundColor: '#255325',
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuButtonText: {
      color: '#f9f9f9',
      fontSize: 36,
      textAlign: 'center', 
      lineHeight: 50, 
    },
    customButton: {
      backgroundColor: '#255325',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginBottom: 10,
    },
    customLargeButton: {
      backgroundColor: '#255325',
      paddingVertical: 20,
      paddingHorizontal: 40,
      borderRadius: 5,
      marginBottom: 10,
    },
    disabledButton: {
      backgroundColor: 'grey',
    },
    buttonText: {
      color: '#f9f9f9',
      textAlign: 'center'
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 20,
      right: 10,
      alignItems: 'flex-end',
    },
    stopRouteContainer: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: -7,
      paddingVertical: 7,
      alignItems: 'center',
    },
    actionContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'absolute',
      left: 10,
      right: 10,
      bottom: 20,
      alignItems: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 20,
      fontSize: 16,
      color: 'gray'
    },
    inputText: {
      padding: 10,
      fontSize : 20,
      width: 300,
      alignSelf: 'center',
      backgroundColor: '#f9f9f9',
    },
    iosControlContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'absolute',
      left: 10,
      bottom: 70,
      right: 100,
      marginBottom: 5,
      alignItems:"left"
    },
    drawerItem: {
    },
    drawerLabel: {
      color: '#f9f9f9',
    },
    drawerActiveItem: {
      backgroundColor: colors.fernGreen,
    },
    drawerInactiveItem: {
      backgroundColor: colors.calPolyGreen,
    },
    drawerStyle: {
      backgroundColor: colors.calPolyGreen,
    },
    gpxListContainer: {
      flex: 1,
      backgroundColor: colors.calPolyGreen,  
    },
    
    
  });