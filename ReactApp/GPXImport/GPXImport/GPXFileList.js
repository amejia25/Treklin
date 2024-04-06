import React, { useState, useEffect } from 'react';
import { Alert, View, Text, TouchableOpacity, Platform, FlatList, PermissionsAndroid, StyleSheet} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Button } from 'react-native';
import * as MediaLibrary from 'expo-media-library'; 
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { pickImage } from './ImageImport';
import MapView, { Marker, Polyline } from 'react-native-maps';

//Filename constants
export const photoWaypointsFile = "importedPhotos.gpx";
export const photoLocalStore = "ImportedPhotos/";

export const importedGPXDirectory = `${FileSystem.documentDirectory}imported/`;
export const createdGPXDirectory = `${FileSystem.documentDirectory}created/`;

// Deletes a single file
export const deleteFile = async (fileName, directory) => {
  try {
    let fullPath = '';
    if(directory === 'created'){
      fullPath = fileName.startsWith('file://') ? fileName : `${createdGPXDirectory}${fileName}`;
    } else {
      fullPath = fileName.startsWith('file://') ? fileName : `${importedGPXDirectory}${fileName}`;
    }
    
    
    await FileSystem.deleteAsync(fullPath);
    //refreshFileList(); // Refresh the list after deleting the file
  } catch (error) {
    console.error('Error deleting GPX file:', error);
  }
};

export const iosShare = async (uri, utiType) => {
  try {
    /*
    const { shareStatus } = await Sharing.isAvailableAsync();
    if (shareStatus !== 'granted') {
      alert('Sharing is not available; check your file and sharing permissions.');
      return;
    } else {
      console.log("Sharing possible, Sharing API available.");
    }
    *///TODO fix share status check, it currently prevents it from working instead of correctly checking status
    // Copy the file from the local app storage to the system storage
    /*
    await FileSystem.copyAsync({
      from: localUri,
      to: systemUri,
    });
    */
    const downloadResult = await Sharing.shareAsync(uri, {UTI: utiType});
    console.log(downloadResult);
  } catch (error) {
    console.error('Error sharing file on iOS: ', error.message);
  }
}

const GPXFileList = ({ navigation }) => {
  //File action state
  const [gpxFiles, setGpxFiles] = useState([]);
  //Media library state
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(null);
  const [activeDirectory, setActiveDirectory] = useState('created'); // 'created' or 'imported'
  const [expandedItem, setExpandedItem] = useState(null);

  const ensureDirectoryExists = async (directory) => {
    const dir = `${FileSystem.documentDirectory}${directory}/`;
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      console.log(`Directory does not exist, creating: ${dir}`);
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
  };

  const loadFilesFromDirectory = async (directory) => {
    try {
      await ensureDirectoryExists(directory);
      const dir = `${FileSystem.documentDirectory}${directory}/`;
      const files = await FileSystem.readDirectoryAsync(dir);
      const filteredFiles = files.filter(file => file.endsWith('.gpx'));
      console.log('Files fetched from', directory, ':', filteredFiles);
      setGpxFiles(filteredFiles);
    } catch (error) {
      console.error(`Error reading GPX files from ${directory}: `, error);
    }
  };

  useEffect(() => {
    console.log('Loading Directory Files...');
    loadFilesFromDirectory(activeDirectory);
  }, [activeDirectory]);


  const importGPXFile = async () => {
    try {
      // Open the document picker for .gpx files
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/gpx+xml', copyToCacheDirectory: true }); // Change the type to 'application/gpx+xml' to only allow GPX files
      //console.log('Document Picker Result:', result);
  
      // Check if a file was selected and not canceled
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Extract the file URI from the first asset
        const fileUri = result.assets[0].uri;
        console.log('GPX File URI: ', fileUri);
  
        // Copy the file from the temporary cache to the app's document directory
        try {
          const dirInfo = await FileSystem.getInfoAsync(importedGPXDirectory);
          if (!dirInfo.exists) {
            console.log('Creating directory:', importedGPXDirectory);
            await FileSystem.makeDirectoryAsync(importedGPXDirectory, { intermediates: true });
          }

          const newFileUri = `${importedGPXDirectory}${result.assets[0].name}`;
          await FileSystem.copyAsync({
            from: fileUri,
            to: newFileUri,
          });

        } catch (e) {
          console.error('Error creating new GPX file:', error);
      throw error;
        }
        
        // Refresh the file list to show the new file
        refreshFileList();
      } else {
        // If no file was selected, log an error or handle it appropriately. It currently logs an error. 
        console.error('No file selected.');
      }
    } catch (error) {
      // If there was an error during the process, log it
      console.error('Error importing GPX file: ', error);
    }
  };

  useEffect(() => {
    const fetchFiles = async () => {
      //console.log('Fetching files...');
      let files;
      try {
        files = await FileSystem.readDirectoryAsync(`${FileSystem.documentDirectory}${activeDirectory}/`);
        const filteredFiles = files.filter(file => file.endsWith('.gpx'));
        setGpxFiles(filteredFiles);
      } catch (error) {
        console.error('Error reading GPX files: ', error);
      }
      if (files) {
        console.log('Files fetched:', files);
      }
    };
    fetchFiles();
  }, []);

  const refreshFileList = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(`${FileSystem.documentDirectory}${activeDirectory}/`);
      const filteredFiles = files.filter(file => file.endsWith('.gpx'));
      console.log('Refreshing file list, files to set: ', filteredFiles);
  
      // Sort the files to ensure mainGPXFile.gpx is always at the top
      const sortedFiles = filteredFiles.sort((a, b) => {
        if (a === 'mainGPXFile.gpx') return -1;
        if (b === 'mainGPXFile.gpx') return 1;
        return a.localeCompare(b); // Sort other files alphabetically
      });  
      setGpxFiles(sortedFiles);
    } catch (error) {
      console.error('Error reading GPX files: ', error);
    }
  };
    

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Focus event triggered');
      refreshFileList();
    });
  
    return unsubscribe;
  }, [navigation]);

  /*
    Log the content of a GPX file to the console when the 'Log Content' button is pressed. 
    This is currently disabled as the user does not need this. Might be useful again in 
    the future so I am just commenting it out. 
  */
  const logGPXContent = async (fileName) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const content = await FileSystem.readAsStringAsync(fileUri);
      console.log(content); 
    } catch (error) {
      console.error('Error reading GPX file:', error);
    }
  };

  // Asks user to confirm deletion of a single file
  const confirmDeleteFile = (fileName, directory) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${fileName}"?`,
      [
        {
          text: "Cancel",
          onPress: () => console.log(`Deletion of ${fileName} cancelled`),
          style: "cancel"
        },
        { text: "Yes", onPress: () => {
          deleteFile(fileName, directory)
          refreshFileList();} 
        }
      ],
      { cancelable: false }
    );
  };

  // Asks user to confirm deletion of all files
  const deleteAllFiles = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete all GPX files?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel"
        },
        { text: "Yes", onPress: () => deleteAllFilesConfirmed() }
      ],
      { cancelable: false }
    );
  };
  
  // Deletes all files
  const deleteAllFilesConfirmed = async () => {
    try {
      for (const fileName of gpxFiles) {
        await FileSystem.deleteAsync(`${FileSystem.documentDirectory}${fileName}`);
      }
      refreshFileList(); // Refresh the list after deleting all files
    } catch (error) {
      console.error('Error deleting all GPX files:', error);
    }
  };

   // Function that handles file download
   const downloadFile = async (fileName, directory) => {
    // Request permissions to access the media library
    const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
    setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");

    //filepaths
    let localUri = `${FileSystem.documentDirectory}${fileName}`;
    if(directory === 'created'){
      localUri = `${createdGPXDirectory}${fileName}`;
    } else {
      localUri = `${importedGPXDirectory}${fileName}`;
    }
    
    const systemUri = `${FileSystem.cacheDirectory}${fileName}`;

    if (Platform.OS === 'android') {//existing content; TODO fix Android issues
      try {
        // Check permissions to access the media library
        if (!hasMediaLibraryPermission) {
          alert('You need to grant storage permissions to download files.');
          return;
        } else {
          console.log("File permissions active.");
        }

        // Copy the file from the local app storage to the system storage
        await FileSystem.copyAsync({
          from: localUri,
          to: systemUri,
        });
    
        // Create an asset for the file in the media library
        //NOTE: this doesn't work on iOS because on iOS MediaLibrary has strict datatypes filters
        const asset = await MediaLibrary.createAssetAsync(systemUri);
    
        // Get or create the album
        let album = await MediaLibrary.getAlbumAsync('GPX Files');
        if (!album) {
          album = await MediaLibrary.createAlbumAsync('GPX Files', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
    
        console.log(`File saved to ${systemUri} in the 'GPX Files' album`);
        return systemUri;
      } catch (error) {
        console.error('Error saving file to system storage on Android: ', error.message);
      }
    }

    if (Platform.OS === 'ios') {
      //console.log("iOS download attempt beginning...");
      await iosShare(localUri, 'public.item');
    }
  };

  const requestFileSystemPermissions = async () => {//specific to the android version
    if (Platform.OS === 'android') {
      try {
        const grantedRead = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "File System Permission",
            message: "App needs access to your file system",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        const grantedWrite = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "File System Permission",
            message: "App needs access to your file system",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (grantedRead === PermissionsAndroid.RESULTS.GRANTED && grantedWrite === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("File system permissions granted");
        } else {
          console.log("File system permission denied");
        }
      } catch (err) {
        console.warn(err);
      }
    }
    if (Platform.OS === 'ios') {
      //NOTE: add any ios permissions for file control in this block
      console.log("No specific permissions for iOS at this point.");
    }
  };
  useEffect(() => {
    requestFileSystemPermissions();
  }, []);

  const handleFilePress = (fileName) => {
    setExpandedItem(expandedItem === fileName ? null : fileName); // Toggle the expanded item
  };

  const handleUseFile = (fileName) => {
    navigation.navigate('Home', { gpxFilePath: `${activeDirectory}/${fileName}`, imported: true });
  };

  //Map Preview Logic
  const MapPreview = ({ fileName, directory }) => {
    const [route, setRoute] = useState([]);
    const [waypoints, setWaypoints] = useState([]);
    const [initialRegion, setInitialRegion] = useState(null);
  
    useEffect(() => {
      const loadGPXData = async () => {
        try {
          let fullPath = `${FileSystem.documentDirectory}${directory}/${fileName}`;
          const fileContent = await FileSystem.readAsStringAsync(fullPath);
          //Will need to change this when tracks get added
          const waypointRegex = /<wpt lat="([-.\d]+)" lon="([-.\d]+)">\s*<name>([^<]+)<\/name>\s*<desc>([^<]+)<\/desc>\s*<rating>(\d+)<\/rating>\s*<id>\d+<\/id>\s*<\/wpt>/g;
          const routeRegex = /<rtept lat="([-.\d]+)" lon="([-.\d]+)">\s*<name>([^<]+)<\/name>\s*<\/rtept>/g;
          
          const waypoints = [];
          let match;
          while ((match = waypointRegex.exec(fileContent)) !== null) {
            waypoints.push({
              latitude: parseFloat(match[1]),
              longitude: parseFloat(match[2]),
              name: match[3],
              description: match[4],
              rating: parseInt(match[5], 10),
            });
          }

          let route = [];
          let routeMatch;
          while ((routeMatch = routeRegex.exec(fileContent)) !== null) {
            route.push({
              latitude: parseFloat(routeMatch[1]),
              longitude: parseFloat(routeMatch[2]),
            });
          }

          setWaypoints(waypoints);
          setRoute(route);

          if (waypoints.length > 0) {
            const firstPoint = waypoints[0];
            setInitialRegion({
              latitude: firstPoint.latitude,
              longitude: firstPoint.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          } else if (route.length > 0) {
            const firstPoint = route[0];
            setInitialRegion({
              latitude: firstPoint.latitude,
              longitude: firstPoint.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          } else {
            // If there are no waypoints or
            setInitialRegion({
              latitude: 34.0522,
              longitude: -118.2437,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          }

          console.log(waypoints);
          console.log(fullPath);
          console.log(fileContent);
        } catch (error) {
          console.error('Error loading GPX data:', error);
        }
      };
  
      loadGPXData();
    }, [fileName, directory]);
    
    //Don't render until map is initlized
    if (!initialRegion) return null;

    return (
      <View style={{
        width: '90%', 
        height: 120, 
        borderWidth: 1, 
        borderColor: 'gray', 
        borderRadius: 5, 
        overflow: 'hidden', 
      }}>
        <MapView
          style={{ flex: 1 }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          initialRegion={initialRegion}>
          {waypoints.map((point, index) => (
            <Marker key={index} coordinate={{ latitude: point.latitude, longitude: point.longitude }} title={point.title} />
          ))}
          {route.length > 1 && (
            <Polyline coordinates={route} strokeColor="#000" strokeWidth={2} />
          )}
        </MapView>
      </View>
    );
  };


  const renderItem = ({ item }) => (
    <View style={[
      styles.itemContainer,
      expandedItem === item ? styles.expandedItemContainer : null
    ]}>
      <TouchableOpacity onPress={() => handleFilePress(item)}>
        <Text style={expandedItem === item ? styles.expandedItemTitle : styles.itemTitle}>{item}</Text>
      </TouchableOpacity>
      {expandedItem === item && (
        <View style={styles.expandedArea}>
          <MapPreview fileName={item} directory={activeDirectory} />
          <View style={styles.buttonContainerHorizontalRight}>
            <TouchableOpacity onPress={() => handleUseFile(item)} style={styles.button}>
              <Text style={styles.buttonText}>Use</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDeleteFile(item, activeDirectory)} style={styles.button}>
              <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => downloadFile(item, activeDirectory)} style={styles.button}>
              <Text style={styles.buttonText}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ padding: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <Button
          title="Created Files"
          onPress={() => setActiveDirectory('created')}
          color={activeDirectory === 'created' ? '#007aff' : 'gray'}
        />
        <Button
          title="Imported Files"
          onPress={() => setActiveDirectory('imported')}
          color={activeDirectory === 'imported' ? '#007aff' : 'gray'}
        />
      </View>
      <FlatList
        data={gpxFiles}
        renderItem={renderItem}
        keyExtractor={item => item}
      />
      <Button title="Import GPX File" onPress={importGPXFile} />
      <Button title="Import Image" onPress={pickImage} />
      {gpxFiles.length >= 2 && (
        <Button title="Delete All" onPress={deleteAllFiles} />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  itemContainer: {
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  expandedItemContainer: {
    backgroundColor: '#f0f0f0',
  },
  itemTitle: {
    padding: 10,
  },
  expandedItemTitle: {
    padding: 10,
    fontSize: 18, 
  },
  expandedArea: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 10,
    paddingTop: 10, 
  },
  boxOutline: {
    width: '50%', 
    height: 100, 
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10
  },
  buttonContainerHorizontalRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end', 
    width: '100%', 
    marginTop: 10, 
  },
  buttonText: {
    marginHorizontal: 5,
    fontSize: 18,
    color: '#007aff', 
  },
  deleteButtonText: {
    color: 'red',
  },
});

export default GPXFileList;
