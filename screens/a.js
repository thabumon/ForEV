import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ImageBackground, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';



const win = Dimensions.get('window');

const Profile = (props) => {
  const [firstName, setFirstName] = useState('');
  
  const [email, setEmail] = useState('');
 


  const [isFocusedFirstName, setIsFocusedFirstName] = useState(false);
  
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
 

  // Function to handle selecting profile photo
//   const handleSelectPhoto = () => {
//     const options = {
//       title: 'Select Profile Photo',
//       storageOptions: {
//         skipBackup: true,
//         path: 'images',
//       },
//     };
    // ImagePicker.showImagePicker(options, (response) => {
    //   if (response.didCancel) {
    //     console.log('User cancelled image picker');
    //   } else if (response.error) {
    //     console.log('ImagePicker Error: ', response.error);
    //   } else if (response.customButton) {
    //     console.log('User tapped custom button: ', response.customButton);
    //   } else {
    //     const source = { uri: response.uri };
    //     setProfileImage(source);
    //   }
    // });
  };
//   useEffect(() => {
//     if (selectedGender === 'male') {
//       setProfileImage(maleAvatar);
//     } else {
//       setProfileImage(femaleAvatar);
//     }
//   }, [selectedGender]);

  return (

    <ImageBackground 
      resizeMode='cover'
      style={{ height: win.height * 1 + 35, width: win.width * 1 }}>
      <SafeAreaView>
        <View style={{ marginTop: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}
            className=""
            >
            <ArrowLeftIcon size="25" color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.mainArea}>
          {/* <View style={styles.profilePhotoContainer}>
            {profileImage ? (
              <Image source={profileImage} style={styles.profilePhoto} />
            ) : (
              <TouchableOpacity style={styles.profilePhoto} onPress={handleSelectPhoto}>
                <Icon name="camera" size={30} color="#ccc" />
              </TouchableOpacity>
            )}
          </View> */}
          {/* First Name Input */}
          {/* <View style={[styles.inputContainer, { marginHorizontal: 70 }]}>
            <Text style={[styles.label1, { color: '#ccc' }]}>Select Gender</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={[styles.radio, selectedGender === 'male' && styles.selectedRadio]}
                onPress={() => setSelectedGender('male')}
              >
                {selectedGender === 'male' && <View style={styles.radioInner} />}
              </TouchableOpacity>
              <Text style={styles.radioLabel}>Male</Text>

              <TouchableOpacity
                style={[styles.radio, selectedGender === 'female' && styles.selectedRadio]}
                onPress={() => setSelectedGender('female')}
              >
                {selectedGender === 'female' && <View style={styles.radioInner} />}
              </TouchableOpacity>
              <Text style={styles.radioLabel}>Female</Text>
            </View>
          </View> */}
          {/* Gender selection */}

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isFocusedFirstName ? '#007bff' : '#ccc' }]}>Name</Text>
            <TextInput
              label='Name'
              style={[
                styles.input,
                {
                  borderBottomColor: isFocusedFirstName ? '#007bff' : '#ccc',
                },
              ]}
              value={firstName}
              onChangeText={setFirstName}
              onFocus={() => setIsFocusedFirstName(true)}
              onBlur={() => setIsFocusedFirstName(false)}
            />
          </View>
          {/* <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isFocusedPhoneNumber ? '#007bff' : '#ccc', marginTop: 2 }]}>Phone Number</Text>
            <TextInput
              label="PhoneNumber"

              keyboardType="phone-pad" // Use keyboardType="phone-pad" to display numeric keyboard
              maxLength={10} // Set the maximum length of the phone number
              style={[
                styles.input,
                {
                  borderBottomColor: isFocusedPhoneNumber ? '#007bff' : '#ccc',
                },
              ]}
              value={PhoneNumber}
              onChangeText={setPhoneNumber}
              onFocus={() => setIsFocusedPhoneNumber(true)}
              onBlur={() => setIsFocusedPhoneNumber(false)}
            />
          </View> */}
          {/* Last Name Input */}
          {/* <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isFocusedLastName ? '#007bff' : '#ccc' }]}>Last Name</Text>
            <TextInput
              label='Last Name'
              style={[
                styles.input,
                {
                  borderBottomColor: isFocusedLastName ? '#007bff' : '#ccc',
                },
              ]}
              value={lastName}
              onChangeText={setLastName}
              onFocus={() => setIsFocusedLastName(true)}
              onBlur={() => setIsFocusedLastName(false)}
            />
          </View> */}

          {/* Address Input */}
          {/* <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isFocusedAddress ? '#007bff' : '#ccc' }]}>Address</Text>
            <TextInput
              label='Address'
              style={[
                styles.input,
                {
                  borderBottomColor: isFocusedAddress ? '#007bff' : '#ccc',
                },
              ]}
              value={address}
              onChangeText={setAddress}
              onFocus={() => setIsFocusedAddress(true)}
              onBlur={() => setIsFocusedAddress(false)}
            />
          </View> */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isFocusedEmail ? '#007bff' : '#ccc' }]}>Email</Text>
            <Text><Text>Email: {user.email}</Text></Text>
            <TextInput
              label='Email'
              style={[
                styles.input,
                {
                  borderBottomColor: isFocusedEmail ? '#007bff' : '#ccc',
                },
              ]}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setIsFocusedEmail(true)}
              onBlur={() => setIsFocusedEmail(false)}
            />
          </View>

          {/* <View style={{ marginTop: 20 }}>
            <TouchableOpacity style={styles.continueButton} onPress={() => props.navigation.navigate("Thanks")}>
              <Text style={styles.continueButtonText}>Go to Dashboard</Text>
              <Image source={require('../assets/arrow-right.png')} style={styles.arrowIcon} />
            </TouchableOpacity>
          </View> */}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};



const styles = StyleSheet.create({
  mainArea: {
    marginTop: win.height * 0.07,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    marginBottom: 5,
    marginHorizontal: 20,
  },
  label1: {
    fontSize: 12,
    marginBottom: 5,
    marginHorizontal: -50,
  },


  input: {
    height: 30,
    borderBottomWidth: 1, // Use borderBottomWidth for underline effect
    borderRadius: 1,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    color: '#000',
    marginHorizontal: 21
  },
  profilePhotoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  continueButton: {
    width: '75%',
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1c75bc',
    borderRadius: 20,
    marginTop: 10,
    flexDirection: 'row',
    borderRadius: 15,
    alignItems: "center",
    alignSelf: "center",
    width: win.width / 1.1,
    paddingVertical: 13,
    marginVertical: 10,
  },
  continueButtonText: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  arrowIcon: {
    width: 25,
    height: 25,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginHorizontal: 20,
    marginTop: 5,
  },
  iconContainer: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 10, // Adjust the value as needed
    top: 20, // Adjust the value as needed to vertically center the tick mark
  },
  picker: {
    backgroundColor: 'white',
    height: 30,
    borderRadius: 1,
    paddingHorizontal: 10,
    marginHorizontal: 21,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: 5
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -60
  },
  selectedRadio: {
    borderColor: '#007bff',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',

  },
  radioLabel: {
    fontSize: 14,
    color: '#000',
    marginHorizontal: 55
  },
});
export default Profile;
