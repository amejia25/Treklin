import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    var result;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
        exif: true
      });
    } catch (error) {
      Alert.alert(
        'Photo Error - Selection',
        'The selected file is not a recognized type, or the import was blocked by your privacy/security settings.',
        [
          { text: 'OK' }
        ],
        { cancelable: false }
      );
      return null;
    }

    let imageData = {"uri":result.assets[0].uri, "exif":result.assets[0].exif};
    console.log(imageData);
    
    if (imageData.exif == null || imageData.exif == undefined) {
      Alert.alert(
        'Photo Error - EXIF',
        'The selected photo is not of the correct type, or does not contain the required location data.',
        [
          { text: 'OK' }
        ],
        { cancelable: false }
      );
      return null;
    }

    if (imageData.exif.GPSLatitude == undefined || imageData.exif.GPSLongitude == undefined) {
      console.log("Image does not contain coords.");
      Alert.alert(
        "Image is not valid",
        "This image does not have valid coordinate data.",
        [{ text: "OK :(" }]
      );
      return null;
    }

    return imageData;

    /*
    let exifObj = result.assets[0].exif;
    let exifUri = result.assets[0].uri;

    console.log(exifObj.DateTimeOriginal);
    console.log(exifObj.GPSAltitude);
    console.log(exifObj.GPSAltitudeRef);
    console.log(exifObj.GPSDateStamp);
    console.log(exifObj.GPSImgDirection);
    console.log(exifObj.GPSImgDirectionRef);
    console.log(exifObj.GPSLatitude);
    console.log(exifObj.GPSLatitudeRef);
    console.log(exifObj.GPSLongitude);
    console.log(exifObj.GPSLongitudeRef);
    console.log(exifObj.GPSHPositioningError);
    console.log(exifObj.GPSTimeStamp);
    console.log(exifObj.GPSSpeed);
    console.log(exifObj.GPSSpeedRef);
    */
};
