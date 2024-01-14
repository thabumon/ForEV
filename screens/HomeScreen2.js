import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, Button, FlatList, Modal } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth'; // Import this based on your Firebase setup
import { auth } from '../config/firebase'; // Check your Firebase configuration
import { Platform, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { UserLocationContext } from '../Components/Context/UserLocationContext'; // Import your UserLocationContext
import GoogleMapView from '../Components/GoogleMapView'; // Adjust the import path as needed
import GlobalApi from '../Services/GlobalApi';


export default function HomeScreen({ navigation }) {
  const [placeList, setPlaceList] = useState([]);
  const [range, setRange] = useState(0);
  const [tempRange, setTempRange] = useState(0);
  // Define and import UserLocationContext here
  const { location, setLocation } = useContext(UserLocationContext);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [displayPlaceListModal, setDisplayPlaceListModal] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [placeListButtonVisible, setPlaceListButtonVisible] = useState(true);
  const [restaurantList, setRestaurantList] = useState([]);

  const searchRef = useRef(null);
  const distanceDataRef = useRef([]);

  const origin = location && location.coords ? `${location.coords.latitude},${location.coords.longitude}` : '';

  const GetNearBySearchPlace = (newRange) => {
      const rangeInMeters = newRange * 1000;

      GlobalApi.nearByPlace(location.coords.latitude, location.coords.longitude, rangeInMeters).then((resp) => {
      getDistances(resp.data.results);
      setDisplayPlaceListModal(true);
      });
  };
  const distanceData = [];
  const getDistances = async (data) => {
      const placeNameList = data.map(place => `${place.geometry.location.lat},${place.geometry.location.lng}`);
      const distancePromises = [];

      placeNameList.forEach(placeItem => {
      const distAPI = async () => {
          const directionsApiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=[${placeItem},${selectedDestination.name}]&key=AIzaSyDCtC15ypeYqwvjn43ZVKkPsvQfPx9_BJc`;
          console.log("PLACEITEMS->", placeItem);
          try {
          const response = await fetch(directionsApiUrl);
          const data = await response.json();
          if (data.status === "OK") {
              return data.rows[0].elements[0].distance.text;
          } else {
              console.error("Error calculating directions:", data.status);
              return 'Error';
          }
          } catch (error) {
          console.error("Error fetching directions:", error);
          return 'Error';
          }
      };
      distancePromises.push(distAPI());
      });

      const distances = await Promise.all(distancePromises);

      const updatedPlaceList = data.map((place, index) => ({
      ...place,
      distance: distances[index],
      }));
      setPlaceList(updatedPlaceList);
  };

  useEffect(() => {
      GlobalApi.getNearbyRestaurants(location.coords.latitude, location.coords.longitude).then((restaurantData) => {
      setRestaurantList(restaurantData.data.results);
      });
  }, []);

  const generateNavigationURL = (destination, waypoints, place) => {
      const destinationP = destination.name;
      const destination_id = destination.place_id;
      const waypoint = place.name;
      const waypoint_id = place.place_id;
      const vicinity = place.vicinity;

      const modifiedUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destinationP}&destination_place_id=${destination_id}&travelmode=driving&waypoints=${waypoint}`;

      const url = Platform.select({
      android: modifiedUrl,
      });

      return url;
  };

  const openNavigation = (place) => {
      const navigationURL = generateNavigationURL(selectedDestination, placeList, place);
      Linking.openURL(navigationURL);
  };

  const handleLogout = async () => {
      await signOut(auth);
  };

  const handleModalSubmit = () => {
      setRange(tempRange);
      GetNearBySearchPlace(tempRange);
      setModalVisible(false);
  };

  const ClearButton = () => {
      return (
      <TouchableOpacity onPress={() => clearSearch()} style={{ padding: 10, marginLeft: 10 }}>
          <Text style={{ fontSize: 20, color: 'gray' }}>x</Text>
      </TouchableOpacity>
      );
  };

  const clearSearch = () => {
      if (searchRef.current) {
      searchRef.current.clear();
      }
  };

  const truncateText = (text, maxLength) => {
      if (text && text.length > maxLength) {
      return text.substring(0, maxLength - 1) + '...';
      }
      return text;
  };

  const renderMapView = () => {
      return <GoogleMapView placeList={placeList} selectedDestination={selectedDestination} />;
  };

  const metersToKilometers = (meters) => {
      return (meters / 1000).toFixed(2); // Convert meters to kilometers and round to 2 decimal places
    };

  const renderLeftButton = () => (
      <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')} style={{ marginLeft: 10 }}>
      <Icon name="user-circle" size={30} style={{ marginTop: 5 }} color="#000" />
      </TouchableOpacity>
  );

  const renderRestaurantList = () => {
      return (
      <FlatList
          data={restaurantList}
          renderItem={({ item, index }) => (
          <View style={{ padding: 10 }}>
              <Text>Name: {item.name}</Text>
              <Text>Vicinity: {item.vicinity}</Text>
              <Button
              title="Navigate"
              onPress={() => {
                  openNavigation(item);
              }}
              />
          </View>
          )}
          keyExtractor={(item, index) => index.toString()}
      />
      );
  };

  return (
      <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
          <GooglePlacesAutocomplete
          ref={searchRef}
          placeholder="Search for a place"
          minLength={3}
          renderLeftButton={renderLeftButton}
          returnKeyType={"search"}
          onPress={(data, details = null) => {
              setSelectedDestination(details);
              setModalVisible(true);
          }}
          enablePoweredByContainer={false}
          fetchDetails={true}
          query={{
              key: 'AIzaSyDCtC15ypeYqwvjn43ZVKkPsvQfPx9_BJc',
              language: 'en',
          }}
          nearbyPlacesAPI="GooglePlacesSearch"
          debounce={300}
          styles={{
              container: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
              },
              textInputContainer: {
              backgroundColor: 'white',
              borderTopWidth: 0,
              borderBottomWidth: 0,
              borderTopLeftRadius: 1,
              borderTopRightRadius: 1,
              borderBottomLeftRadius: 1,
              borderBottomRightRadius: 1,
              width: '100%',
              alignSelf: 'center',
              },
              textInput: {
              marginLeft: 0,
              marginRight: 0,
              height: 40,
              color: '#5d5d5d',
              fontSize: 15,
              borderTopLeftRadius: 1,
              borderTopRightRadius: 1,
              borderBottomLeftRadius: 1,
              borderBottomRightRadius: 1,
              },
              predefinedPlacesDescription: {
              color: '#1faadb',
              },
          }}
          />

          {renderMapView()}       

          {!modalVisible && selectedDestination && (
          <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{ alignItems: 'center', position: 'absolute', bottom: 600, left: '5%' }}
          >
              <View style={{ padding: 1, borderRadius: 10, width: '100%', backgroundColor: '#2c8de8', flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="gas-pump" size={25} color="white" style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 13, color: 'white' }}>Range: {range.toFixed(2)} Km</Text>
              </View>
          </TouchableOpacity>     
          )}

          <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
          style={{ justifyContent: 'flex-end', margin: 0, width: '80%', height: '50%', marginLeft: 40 }}
          >
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, borderBottomLeftRadius: 30, marginBottom: 40, borderBottomRightRadius: 30 }}>
              <Text style={{ textAlign: 'center', marginTop: 10 }}>Enter Range</Text>
              <Slider
              style={{ width: '90%', height: '15%', alignSelf: 'center', marginTop: '30%', marginBottom: '0%' }}
              step={1}
              minimumValue={0}
              maximumValue={600}
              value={tempRange}
              onValueChange={(value) => setTempRange(value)}
              />
              <Text style={{ textAlign: 'center', marginTop: 10 }}>Range : {tempRange.toFixed(2)} km</Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 }}>
              <Button
                  title="Submit"
                  onPress={handleModalSubmit}
                  style={{ flex: 1, width: '20%' }}
              />
              <Button
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1, marginLeft: 10 }}
              />
              </View>
          </View>
          </Modal>

          <Modal
          isVisible={displayPlaceListModal}
          onBackdropPress={() => setDisplayPlaceListModal(false)}
          style={{ justifyContent: 'flex-end', margin: 0, width: '80%', height: '40%', marginBottom: 30, marginTop: 400, marginLeft: 40, marginRight: 0 }}
          >
          <View style={{ flex: 1, backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
              <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{ position: 'absolute', marginLeft: 80, marginTop: 10 }}
              >
              <View style={{ backgroundColor: '#2c8de8', padding: 10, borderRadius: 5 }}>
                  <Text style={{ color: 'white' }}>
                  Range: {range.toFixed(2)} Km
                  </Text>
              </View>
              </TouchableOpacity>
              <Text style={{ textAlign: 'center', marginTop: 50 }}>Places Along the Route: {placeList.length}</Text>

              <FlatList
              data={placeList}
              renderItem={({ item, index }) => (
                  <View style={{ padding: 10 }}>
                  <Text>Name: {truncateText(item.name, 25)}</Text>
                  <Text>Distance: {item.distance}</Text>
                  <Button
                      title="Navigate"
                      onPress={() => {
                      openNavigation(item);
                      }}
                  />
                  </View>
              )}
              keyExtractor={(item, index) => index.toString()}
              />

              {restaurantList.length > 0 && (
              <>
                  <Text style={{ textAlign: 'center', marginTop: 20 }}>Restaurants Near EV Stations:</Text>
                  {renderRestaurantList()}
              </>
              )}
          </View>
          </Modal>
      </View>
      </SafeAreaView>
  );
}