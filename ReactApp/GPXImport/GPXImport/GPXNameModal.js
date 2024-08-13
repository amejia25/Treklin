import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import {colors} from './styles';

// Function to generate default file name
const getDefaultFileName = () => {
  const currDate = new Date();
  const fileNameDateTime = `${currDate.getFullYear()}-${
    String(currDate.getMonth() + 1).padStart(2, '0')}-${
    String(currDate.getDate()).padStart(2, '0')}_${
    String(currDate.getHours()).padStart(2, '0')}-${
    String(currDate.getMinutes()).padStart(2, '0')}-${
    String(currDate.getSeconds()).padStart(2, '0')}`;
  return `${fileNameDateTime}`;
};

const GPXNameModal = ({ isVisible, onConfirm }) => {
  const [fileName, setFileName] = useState(getDefaultFileName());

  useEffect(() => {
    // Update the fileName state every time the modal becomes visible
    if (isVisible) {
      setFileName(getDefaultFileName());
    }
  }, [isVisible]);

  const handleConfirm = () => {
    onConfirm(fileName.trim() || "Unnamed Route");
    setFileName(getDefaultFileName()); // Reset the input field with new default name
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => {}}
      >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Name Your Route:</Text>
          <TextInput
            placeholder="Enter file name"
            style={styles.input}
            value={fileName}
            onChangeText={setFileName}
            selectTextOnFocus={true} // Highlight text when input is focused
          />
          <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleConfirm} style={[styles.button, { backgroundColor: colors.calPolyGreen, width: '50%' }]}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>

          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22,
    },
    modalView: {
      margin: 20,
      width: '80%',
      backgroundColor: colors.alabaster,
      borderRadius: 20,
      padding: 35,
      alignItems: "flex-start", 
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    input: {
      height: 40,
      marginVertical: 8, 
      borderWidth: 1,
      padding: 10,
      width: '100%',
      backgroundColor: '#f9f9f9'
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center', 
      width: '100%',
      marginTop: 8, 
    },
    button: {
      backgroundColor: "calPolyGreen",
      padding: 10,
      borderRadius: 20,
      alignSelf: 'center', 
      width: '100%', 
    },
    cancelButton: {
      backgroundColor: "#f44336",
    },
    buttonText: {
      color: '#f9f9f9',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalText: {
      marginBottom: 8,
      textAlign: "left", 
      fontWeight: 'bold',
      width: '100%', 
    },
  });
  

export default GPXNameModal;
