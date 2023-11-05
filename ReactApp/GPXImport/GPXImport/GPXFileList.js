import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Button } from 'react-native';

const GPXFileList = ({ navigation }) => {
  const [gpxFiles, setGpxFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      console.log('Fetching files...');
      let files;
      try {
        files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
        const filteredFiles = files.filter(file => file.endsWith('.gpx'));
        setGpxFiles(filteredFiles);
      } catch (error) {
        console.error('Error reading GPX files:', error);
      }
      if (files) {
      console.log('Files fetched:', files);
    } 
  };

    fetchFiles();
  }, []);

  const refreshFileList = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      const filteredFiles = files.filter(file => file.endsWith('.gpx'));
      console.log('Refreshing file list, files to set:', filteredFiles);
      setGpxFiles(filteredFiles);
    } catch (error) {
      console.error('Error reading GPX files:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Focus event triggered');
      refreshFileList();
    });
  
    return unsubscribe;
  }, [navigation]);

  const logGPXContent = async (fileName) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const content = await FileSystem.readAsStringAsync(fileUri);
      console.log(content); // This will log the content to the console
    } catch (error) {
      console.error('Error reading GPX file:', error);
    }
  };

  const deleteFile = async (fileName) => {
    try {
      await FileSystem.deleteAsync(`${FileSystem.documentDirectory}${fileName}`);
      refreshFileList(); // Refresh the list after deleting the file
    } catch (error) {
      console.error('Error deleting GPX file:', error);
    }
  };

  const deleteAllFiles = async () => {
    try {
      for (const fileName of gpxFiles) {
        await FileSystem.deleteAsync(`${FileSystem.documentDirectory}${fileName}`);
      }
      refreshFileList(); // Refresh the list after deleting all files
    } catch (error) {
      console.error('Error deleting all GPX files:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
      <TouchableOpacity
        onPress={() => {
          // We might need on press functionality for the list items in the future. But empty for now. 
        }}
        style={{ flex: 1 }}
      >
        <Text>{item}</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Button title="Delete" onPress={() => deleteFile(item)} />
        <Button title="Log Content" onPress={() => logGPXContent(item)} />
      </View>
    </View>
  );
  

  return (
    <View>
      <FlatList
        data={gpxFiles}
        renderItem={renderItem}
        keyExtractor={item => item}
      />
      <Button title="Delete All" onPress={deleteAllFiles} />
    </View>
  );
};

export default GPXFileList;
