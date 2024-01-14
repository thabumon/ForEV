import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
  TextInput, // Import the TextInput component
} from 'react-native';
import { auth } from '../config/firebase';
import { Picker } from '@react-native-picker/picker';
import { SignUpNameContext } from './SignUpScreen';
import ImagePicker from 'react-native-image-picker'; // Import the image picker library
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon } from 'react-native-heroicons/solid'

const win = Dimensions.get('window');

const carData = [
  {
    brand: 'Tata',
    models: ['Nexon EV', 'Xpres-TEV', 'Tigor Ziptron EV', 'Nexon EV Max', 'Tiago EV', 'Tiago EV Long Range'],
  },
  {
    brand: 'MG',
    models: ['MG ZS EV', 'MG ZS EV 2022', 'MG Comet'],
  },
  {
    brand: 'Hyundai',
    models: ['Hyundai kona Electric', 'Hyundai IONIQ 5'],
  },
  {
    brand: 'Mahindra',
    models: ['Mahindra e2oPlus', 'Mahindra e-Verito', 'Mahindra XUV400 EC', 'Mahindra XUV400 EL'],
  },
  {
    brand: 'Benz',
    models: ['EQC', 'EQS', 'EQB', 'AMG EQS'],
  },
  {
    brand: 'Jaguar',
    models: ['I-Pace'],
  },
  {
    brand: 'Mini Cooper',
    models: ['Mini Cooper SE'],
  },
  {
    brand: 'Tesla',
    models: ['Tesla Model Y'],
  },
  {
    brand: 'Audi',
    models: ['Audi e-tron', 'Audi e-tron gt', 'Audi RS e-tron gt'],
  },
  {
    brand: 'Volvo',
    models: ['Volvo XC40 Recharge'],
  },
  {
    brand: 'BYD',
    models: ['BYD E6', 'BYD Atto 3'],
  },
  {
    brand: 'Kia',
    models: ['Kia EV 6'],
  },
  {
    brand: 'BMW',
    models: ['BMW i4', 'BMW i7', 'BMW ix'],
  },
  // Add more car brands and models here
];

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [avatarUri, setAvatarUri] = useState(null); // To store the avatar image URI
  const [name, setName] = useState('');
const [phone, setPhone] = useState('');



  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser, name) => {
      if (authUser) {
        setUser(authUser);
        console.log('user is', name);
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const openCarSelectionModal = () => {
    setModalVisible(true);
  };

  const closeCarSelectionModal = () => {
    setModalVisible(false);
    setSelectedBrand(null);
    setSelectedModel(null);
  };

  const selectBrand = (brand) => {
    setSelectedBrand(brand);
  };

  const selectModel = (model) => {
    setSelectedModel(model);
    setModalVisible(false);
  };

  const handleChooseImage = () => {
    const options = {
      title: 'Select Avatar',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        // Save the selected image to Firebase Storage
        uploadImage(response.uri);
      }
    });
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const ref = storage.ref().child(`avatars/${user.uid}`);
      await ref.put(blob);

      // Get the download URL and set it to the state
      const downloadURL = await ref.getDownloadURL();
      setAvatarUri(downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    
    <View style={styles.container}>
          <SafeAreaView className="flex ">
        <View className="flex-row justify-start">
          <TouchableOpacity onPress={() => navigation.goBack()}
            className=" p-2 rounded-tr-2xl rounded-bl-2xl ml-4"
            >
            <ArrowLeftIcon size="20" color="#2c8de8" />
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-end">
          <Image source={require('../assets/icon.png')}
            style={{ width: 100, height: 100 }} />
        </View>


      </SafeAreaView>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handleChooseImage}>
          <Image
            source={
              avatarUri
                ? { uri: avatarUri }
                : require('../assets/profile.png')
            }
            style={styles.profileAvatar}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.profileInfo}>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Name :</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(text) => setName(text)}
            placeholder="Enter your name"
          />
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Email :</Text>
          <Text style={styles.value}>{user ? user.email : 'N/A'}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Phone :</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={(text) => setPhone(text)}
            placeholder="Enter your phone number"
          />
        </View>
        <TouchableOpacity
          style={styles.selectCarButton}
          onPress={openCarSelectionModal}
        >
          <Text style={styles.selectCarButtonText}>
            {selectedBrand
              ? `Selected Car: ${selectedBrand} ${selectedModel || ''}`
              : 'Select Your Car'}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutButtonText}>
          SIGN OUT
        </Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Car</Text>

            {/* Brand Selection */}
            <Picker
              selectedValue={selectedBrand}
              onValueChange={(itemValue) => selectBrand(itemValue)}
              mode="dropdown"
            >
              <Picker.Item label="Select Brand" value={null} />
              {carData.map((item) => (
                <Picker.Item
                  key={item.brand}
                  label={item.brand}
                  value={item.brand}
                />
              ))}
            </Picker>

            {/* Model Selection */}
            {selectedBrand && (
              <Picker
                selectedValue={selectedModel}
                onValueChange={(itemValue) => selectModel(itemValue)}
                mode="dropdown"
              >
                <Picker.Item label="Select Model" value={null} />
                {carData
                  .find((item) => item.brand === selectedBrand)
                  ?.models.map((model) => (
                    <Picker.Item
                      key={model}
                      label={model}
                      value={model}
                    />
                  ))}
              </Picker>
            )}

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={closeCarSelectionModal}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  profileHeader: {
    marginTop:-120,
    justifyContent: 'center',
    alignItems: 'center',
    height:220,
    zIndex:0,
  },
  icon: {
    width: 100,
    height: 100,
    top:30,
    left:-140,
    padding:15,
    zIndex:2,
  },
  profileAvatar: {
    width: 120,
    height: 120,
    top:50,
    zIndex:2,
  },
  profileName: {
    fontSize: 18,
    color: 'white',
    marginTop: 20,
  },
  profileInfo: {
    marginTop: 40,
    margin: 20,
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    marginLeft:50
  },
  selectCarButton: {
    backgroundColor: '#1c75bc',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  selectCarButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signOutButton:{
    backgroundColor: '#1c75bc',
    width:'80%',
    marginLeft:40,
    padding: 15,
    borderRadius: 10,
    marginTop: 80,
    alignItems: 'center',

  },
  signOutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: win.width,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  closeModalButton: {
    backgroundColor: '#1c75bc',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 18,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 50,
  },
});
