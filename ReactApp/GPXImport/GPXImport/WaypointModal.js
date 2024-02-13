import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';

const WaypointModal = ({ isVisible, onConfirm, onCancel, timeout = 10000 }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const progressAnim = useRef(new Animated.Value(0)).current; // Initial progress is 0
  const [animationStarted, setAnimationStarted] = useState(false);

  const resetState = () => {
    setTitle('');
    setDescription('');
    progressAnim.setValue(0); // Reset progress
    setAnimationStarted(false);
  };

  useEffect(() => {
    if (isVisible && !animationStarted) {
      // Mark the animation as started
      setAnimationStarted(true);

      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: timeout,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          // Automatically confirm when the animation is complete
          onConfirm(title || "Unnamed Waypoint", description || "No description");
          resetState();
        }
      });
    }
  }, [isVisible, animationStarted, onConfirm, title, description, progressAnim, timeout]);

  useEffect(() => {
    // Reset state when modal is closed
    if (!isVisible) {
      resetState();
    }
  }, [isVisible]);

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'], // Progress bar width
  });

  const handleConfirm = () => {
    onConfirm(title, description);
    resetState();
  };

  const handleCancel = () => {
    onCancel();
    resetState();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleCancel}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TextInput
            placeholder="Title"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            placeholder="Description"
            style={[styles.input, styles.descriptionInput]}
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, { width: progressBarWidth }]} />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleConfirm} style={styles.button}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancel} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.buttonText}>Cancel</Text>
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
    marginTop: 22
  },
  progressBarContainer: {
    width: '100%',
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  modalView: {
    margin: 20,
    width: '80%', // Make the modal larger
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '100%', 
  },
  descriptionInput: {
    height: 100, 
  },
  buttonContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%', 
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 20,
    margin: 10,
    width: '40%', 
    alignItems: 'center', 
  },
  cancelButton: {
    backgroundColor: "#f44336", 
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WaypointModal;
