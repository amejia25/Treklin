import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors } from './styles';

const WaypointSelectionModal = ({ isVisible, waypoint, onDelete, onUpdate, onCancel, imported }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(waypoint ? waypoint.rating : 2);
  const [editable, setEditable] = useState(false);

  React.useEffect(() => {
    if (waypoint) {
        console.log(waypoint);
      setTitle(waypoint.name || 'No Title');
      setDescription(waypoint.desc || 'No Description');
      setRating(waypoint.rating);
    }
  }, [waypoint, isVisible]);

  const handleConfirm = () => {
    if (editable) {
      onUpdate(waypoint.id, title, description, rating);
      setEditable(false);
    }
    onCancel();
  };

  const updateRating = (newRating) => {
    if (editable) {
      setRating(newRating);
    }
  };

  const getButtonColor = (ratingValue) => {
    return rating === ratingValue ? colors.calPolyGreen : '#B3C6A7';
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onCancel}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Waypoint Info</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            editable={editable}
          />
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={description}
            onChangeText={setDescription}
            editable={editable}
            multiline
          />
          <View style={styles.ratingContainer}>
            <TouchableOpacity onPress={() => updateRating(1)} style={[styles.ratingButton, { backgroundColor: getButtonColor(1) }]}>
              <Image source={require('./assets/icons/sad.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => updateRating(2)} style={[styles.ratingButton, { backgroundColor: getButtonColor(2) }]}>
              <Image source={require('./assets/icons/neutral-face.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => updateRating(3)} style={[styles.ratingButton, { backgroundColor: getButtonColor(3) }]}>
              <Image source={require('./assets/icons/happiness.png')} style={styles.icon} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleConfirm} style={styles.largeButton}>
            <Text style={styles.buttonText}>{editable ? 'Update' : 'Okay'}</Text>
          </TouchableOpacity>
          {!imported && (
            <>
              <TouchableOpacity onPress={onCancel} style={[styles.largeButton, styles.cancelButton]}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <View style={styles.editButtonContainer}>
                <TouchableOpacity onPress={() => setEditable(!editable)} style={styles.squareButton}>
                  <Image
                    source={editable ? require('./assets/icons/cancel.png') : require('./assets/icons/edit.png')}
                    style={styles.icon}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(waypoint.id)} style={styles.squareButtonRed}>
                  <Image
                    source={require('./assets/icons/trash.png')}
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
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
  modalView: {
    margin: 20,
    width: '80%',
    backgroundColor: "#F6F7EF",
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    width: '100%',
    backgroundColor: '#f9f9f9'
  },
  descriptionInput: {
    height: 100,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#E5E7DC'  
  },
  ratingButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#50753C'  
  },
  largeButton: {
    backgroundColor: colors.calPolyGreen, // previously #50753C, just in case we wanna revert
    padding: 12,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    margin: 5,
  },
  cancelButton: {
    width: '65%',
    backgroundColor: 'firebrick', // previously #182914, just in case we wanna revert later.
  },
  buttonText: {
    color: '#f9f9f9',
    fontWeight: 'bold',
  },
  editButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 10
  },
  squareButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.calPolyGreen,
    borderRadius: 10,
    marginTop: 25
  },
  squareButtonRed: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'firebrick', // previously #182914, just in case we wanna revert later. 
    borderRadius: 10,
    marginTop: 25,
  },
  icon: {
    width: 30,
    height: 30,
  },
});

export default WaypointSelectionModal;
