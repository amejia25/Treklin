import React, { useState, useEffect } from 'react';
import { Text, ScrollView } from 'react-native';
import * as FileSystem from 'expo-file-system';

const GPXViewer = ({ navigation, route }) => {
  const { fileName } = route.params; // Assuming you're passing the file name as a route param
  const [gpxContent, setGpxContent] = useState('');

  useEffect(() => {
    const loadFile = async () => {
      try {
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        const content = await FileSystem.readAsStringAsync(fileUri);
        setGpxContent(content);
      } catch (error) {
        console.error('Error reading GPX file:', error);
      }
    };

    loadFile();
  }, [fileName]);

  return (
    <ScrollView>
      <Text>{gpxContent}</Text>
    </ScrollView>
  );
};

export default GPXViewer;
