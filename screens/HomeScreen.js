import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Button, FlatList, Image, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper'; // Import TextInput and Button from react-native-paper
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import GlobalApi from '../Services/GlobalApi';
import { UserLocationContext } from '../Components/Context/UserLocationContext';
import Modal from 'react-native-modal';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Platform, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Card, Title, Paragraph } from 'react-native-paper'; // Import components from react-native-paper
import GoogleMapView from '../Components/GoogleMapView'; // Adjust the import path as needed

export default function HomeScreen({ navigation }) {
  const [range, setRange] = useState(0);
  const [tempRange, setTempRange] = useState(0);
  const { location, setLocation } = useContext(UserLocationContext);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [displayPlaceListModal, setDisplayPlaceListModal] = useState(false);
  const [highlightedPlace, setHighlightedPlace] = useState(null);
  const [evStations, setEvStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('')
  const [mapCenter, setMapCenter] = useState(null);

  const searchRef = useRef(null);
  const originRef = useRef(null);

  const origin = location && location.coords ? `${location.coords.latitude},${location.coords.longitude}` : '';
  const [startLocationDefault, setStartLocationDefault] = useState('');
  // Update default value when currentLocation changes
  useEffect(() => {
    if (currentLocation) {
      setStartLocationDefault(currentLocation.description || '');
    }
  }, [currentLocation]);

  useEffect(() => {
    if (location && location.coords) {
      // Update map location when the component mounts or location changes
      const initialLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      updateMapLocation(initialLocation);
    }
  }, [location]);

  const updateMapLocation = (newLocation) => {
    console.log('Updating map location:', newLocation);
    setMapCenter(newLocation);
  };

  const currentPlace = {
    description: 'Your Location',
    geometry: { location: { lat: location?.coords?.latitude, lng: location?.coords?.longitude } },
  };


  const updateRestaurantsForStation = async (station) => {
    try {
      const stationLat = station.geometry.location.lat;
      const stationLng = station.geometry.location.lng;
      let restaurants = await GlobalApi.getNearestRestaurants(stationLat, stationLng);

      restaurants = await Promise.all(restaurants.map(async (restaurant) => {
        const restaurantLoc = `${restaurant.geometry.location.lat},${restaurant.geometry.location.lng}`;
        const distanceText = await getDistanceFromStation(stationLat, stationLng, restaurantLoc);
        const distanceValue = parseFloat(distanceText.split(' ')[0]);
        return { ...restaurant, distance: distanceText, distanceValue };
      }));

      restaurants.sort((a, b) => a.distanceValue - b.distanceValue);
      const nearbyRestaurants = restaurants.slice(0, 5);

      setEvStations((prevStations) => {
        return prevStations.map((s) => {
          if (s.place_id === station.place_id) {
            return { ...s, nearbyRestaurants: nearbyRestaurants };
          }
          return s;
        });
      });
    } catch (error) {
      console.error('Error fetching restaurants for station:', station.place_id, error);
    }
  };

  const getDistanceFromStation = async (stationLat, stationLng, restaurantLoc) => {
    try {
      const origin = `${stationLat},${stationLng}`;
      const destination = restaurantLoc;
      const distanceText = await GlobalApi.fetchDistance(origin, destination);
      return distanceText;
    } catch (error) {
      console.error("Error getting distance from station:", error);
      return 'Error';
    }
  };

  const fetchRestaurantsForStations = (stations) => {
    setLoadingRestaurants(true);
    const updates = stations.map((station) => updateRestaurantsForStation(station));
    Promise.all(updates).then(() => {
      setLoadingRestaurants(false);
    });
  };

  const originToUse = currentLocation ? `${currentLocation.geometry.location.lat},${currentLocation.geometry.location.lng}` : origin;

  const GetNearByStations = () => {
    if (currentLocation) {
      const range = 10000; // Set the desired range (e.g., 10 km) in meters
  
      setLoadingStations(true);
  
      GlobalApi.nearByPlace(
        currentLocation?.geometry?.location?.lat,
        currentLocation?.geometry?.location?.lng,
        range
      )
        .then((resp) => {
          console.log(resp);
  
          if (resp && resp.data && resp.data.results && resp.data.results.length > 0) {
            getDistances(resp.data.results);
            setEvStations(resp.data.results);
            setDisplayPlaceListModal(true);
            fetchRestaurantsForStations(resp.data.results);
          } else {
            console.error('No EV stations found nearby.');
          }
  
          setLoadingStations(false);
        })
        .catch((error) => {
          console.error('Error fetching nearby EV stations:', error);
          setLoadingStations(false);
        });
    } else {
      console.error('Current location information is missing.');
    }
  };
  
  
  


  console.log('stations:', evStations)
  console.log('Loading Stations:', loadingStations)
  console.log('Loading Restaurants:', loadingRestaurants)

  const getDistances = async (data) => {
    const placeNameList = data.map(place => `${place.geometry.location.lat},${place.geometry.location.lng}`);
    const distancePromises = [];

    const originToUse = currentLocation ? `${currentLocation.geometry.location.lat},${currentLocation.geometry.location.lng}` : origin;


    placeNameList.forEach(placeItem => {
      const distAPI = async () => {
        const directionsApiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originToUse}&destinations=${placeItem}&key=AIzaSyDCtC15ypeYqwvjn43ZVKkPsvQfPx9_BJc`;
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

    updatedPlaceList.sort((a, b) => {
      const distanceA = parseFloat(a.distance.split(' ')[0]);
      const distanceB = parseFloat(b.distance.split(' ')[0]);
      return distanceB - distanceA;
    });

    setEvStations(updatedPlaceList);
  };


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
    const navigationURL = generateNavigationURL(selectedDestination, evStations, place);
    Linking.openURL(navigationURL);
  };




  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleModalSubmit = () => {
    setEvStations([]);
    setRange(tempRange);
    GetNearByStations(); // <-- Assuming this is the correct function to call
    setModalVisible(false);
  };
  

  const ClearButtonOrigin = () => {
    return (
      <TouchableOpacity onPress={() => clearSearchOrigin()} style={{ padding: 10, marginRight: 20, }}>
        <Text style={{ fontWeight: 600, fontSize: 20, color: 'grey' }}>x</Text>
      </TouchableOpacity>
    );
  };

  const ClearButton = () => {
    return (
      <TouchableOpacity onPress={() => clearSearch()} style={{ padding: 10, marginRight: 20, }}>
        <Text style={{ fontWeight: 600, fontSize: 20, color: 'grey' }}>x</Text>
      </TouchableOpacity>
    );
  };

  const clearSearchOrigin = () => {
    if (originRef.current) {
      originRef.current.clear();
      setCurrentLocation('');
    } else {
      console.error('Ref not found');
    }
  }


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
    return (
      <GoogleMapView
        placeList={evStations}
        selectedDestination={selectedDestination}
        highlightedPlace={highlightedPlace}
        onPlacePress={(place) => setHighlightedPlace(place)}
      />
    );
  };

  const renderLeftButton = () => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProfileScreen')}
      style={{
        marginLeft: 0,
        borderRadius: 30, // Set border radius to make it round
        backgroundColor: '#1c75bc', // Background color for the button
        padding: 10,
        marginTop: 70,
        width: 60, // Set width and height to make it round
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name="user-astronaut" size={30} color="white" />
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 0 }}>
        {/* Map as a full-screen background */}
        <GoogleMapView
              placeList={evStations}
              selectedDestination={selectedDestination}
              highlightedPlace={highlightedPlace}
              onPlacePress={(place) => setHighlightedPlace(place)}
              customLocation={currentLocation}
              style={{ flex: 1, width: '100%', height: '100%', margin: 0, padding: 0 }}
            />

        <View style={{ position: 'absolute', top: 10, left: 20, right: 20, zIndex: 2 }}>
          {renderLeftButton()}
        </View>

       <GooglePlacesAutocomplete
        ref={originRef}
        placeholder="Choose start location"
        renderRightButton={() => <ClearButtonOrigin />}
        defaultValue={startLocationDefault}
        onPress={(data, details = null) => {
          if (details && details.geometry) {
            setCurrentLocation(details);
            const newLocation = {
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
            };
            updateMapLocation(newLocation);
          }
        }}
        
          enablePoweredByContainer={false}
          fetchDetails={true}
          query={{
            key: 'AIzaSyDCtC15ypeYqwvjn43ZVKkPsvQfPx9_BJc',
            language: 'en',
          }}
          currentLocation={true}
          currentLocationLabel='Current location'
          predefinedPlaces={[currentPlace]}
          styles={{
            container: {
              position: 'absolute',
              bottom: 180, // Adjust the top position based on your preference
              left: 0,
              right: 0,
              zIndex: 1,
            },
            textInputContainer: {
              backgroundColor: 'white',
              borderRadius: 10,
              marginTop: 10,
              width: '90%',
              alignSelf: 'center',
            },
            textInput: {
              marginLeft: 0,
              marginRight: 0,
              marginTop: 5,
              height: 40,
              color: '#5d5d5d',
              fontSize: 15,
              borderRadius: 10,
            },
            predefinedPlacesDescription: {
              color: '#1faadb',
            },
            listView: {
              backgroundColor: '#ffffff',
              color: '#5d5d5d',
              borderRadius: 10,
              width:'85%',
              alignSelf: 'center',
            },
            poweredContainer: {
              display: 'none', // Hide the 'powered by Google' container
            },
            description: {
              fontWeight: 'bold',
            },
          }}
        />
        <GooglePlacesAutocomplete
          ref={searchRef}
          placeholder="Enter your Destination"
          minLength={3}
          renderRightButton={() => <ClearButton />}
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
              bottom: 120, // Adjust the top position based on your preference
              left: 0,
              right: 0,
              zIndex: 1,
            },
            textInputContainer: {
              backgroundColor: 'white',
              borderRadius: 10,
              marginTop: 10,
              width: '90%',
              alignSelf: 'center',
            },
            textInput: {
              marginLeft: 0,
              marginRight: 0,
              marginTop: 5,
              height: 40,
              color: '#5d5d5d',
              fontSize: 15,
              borderRadius: 10,
            },
            predefinedPlacesDescription: {
              color: '#1faadb',
            },
          }}
        />
        <View style={{ position: 'absolute', bottom: 90, alignSelf: 'center', zIndex: 2 }}>
          <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold' }}>OR</Text>
        </View>
        {/* Button for finding nearby EV stations */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 30,
            left: 80,
            backgroundColor: '#1c75bc',
            padding: 15,
            borderRadius: 10,
            zIndex: 2,
          }}
          onPress={GetNearByStations}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Find Nearby EV Stations (15 km)</Text>
        </TouchableOpacity>

        {!modalVisible && selectedDestination && (
          <View style={{
            position: 'absolute',
            top: 260,
            left: '5%',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{ position: 'absolute', marginLeft: 0, zIndex: 2 }}
            >
              <Card style={{
                marginLeft: 0,
                borderRadius: 30, // Set border radius to make it round
                backgroundColor: '#1c75bc', // Background color for the button
                padding: 10,
                marginTop: 0,
                width: 60, // Set width and height to make it round
                height: 60,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon name="charging-station" size={25} color="white" />
                {/* <Text style={{ fontSize: 13, color: 'white' }}>Range: {range.toFixed(2)} Km</Text> */}
              </Card>
            </TouchableOpacity>
          </View>
        )}

      </View>

      {!modalVisible && selectedDestination && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 140,
            left: '5%',
          }}
          onPress={() => setDisplayPlaceListModal(true)}
        >
          <Card style={{
            marginLeft: 0,
            borderRadius: 30, // Set border radius to make it round
            backgroundColor: '#1c75bc', // Background color for the button
            padding: 10,
            marginTop: 0,
            width: 60, // Set width and height to make it round
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon name="list" size={24} color="white" style={{ marginRight: 0 }} />
          </Card>
        </TouchableOpacity>
      )}

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={{
          justifyContent: 'flex-end',
          margin: 0,
          width: '80%',
          height: '40%',
          marginLeft: 40,
        }}
      >
        <View style={{
          backgroundColor: 'white',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          marginBottom: 40,
        }}>
          <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 20, fontWeight: 'bold' }}>Range left in the car</Text>
          <Slider
              style={{ width: '90%', height: '5%', alignSelf: 'center', marginTop: 20, marginBottom: 20, color: '#2c8de8' }}
              step={1}
              minimumValue={0}
              maximumValue={600}
              value={tempRange}
              onValueChange={(value) => setTempRange(value)}
            />
          <Text style={{ textAlign: 'center' }}>Range: {tempRange.toFixed(2)} km</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleModalSubmit}
            >
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </View>

        </View>
      </Modal>

      <Modal
        isVisible={displayPlaceListModal}
        onBackdropPress={() => setDisplayPlaceListModal(false)}
        style={{
          justifyContent: 'flex-end',
          margin: 0,
          width: '90%', // Use full width
          height: '90%', // Adjust the height as needed
          marginTop: 20,
          marginBottom: 20,
          marginLeft: 20,
          marginRight: 20,
        }}
      >
        <View style={{
          flex: 1,
          backgroundColor: '#F5F5F5', // Subtle background color
          borderRadius: 20, // Slightly round the corners
          paddingHorizontal: 20, // Add padding to the sides
          paddingTop: 20, // Add padding to the top
        }}>
          {/* Close button */}
          <TouchableOpacity
            onPress={() => setDisplayPlaceListModal(false)}
            style={{ position: 'absolute', right: 20, top: 20, zIndex: 2 }}
          >
            <View style={{ backgroundColor: '#2c8de8', padding: 10, borderRadius: 10 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>  X  </Text>
            </View>
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{ position: 'absolute', zIndex: 2, left: 0 }}
            >
              <View style={{ backgroundColor: '#2c8de8', padding: 10, borderRadius: 10 }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  Range: {range.toFixed(2)} Km
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={{ textAlign: 'center', marginTop: 60, marginBottom: 20, fontSize: 18, fontWeight: 'bold', color: '#333' }}>
            Places Along the Route: {evStations.length}
          </Text>



          <FlatList
            data={evStations}
            renderItem={({ item: station, index }) => (
              <TouchableOpacity
                onPress={() => setHighlightedPlace(station)}
              >
                <View style={{
                  height: 100,
                  width: '100%', // Use full width
                  padding: 10,
                  backgroundColor: highlightedPlace === station ? '#EFEFEF' : '#2c8de8',
                  borderBottomWidth: 1,
                  borderBottomColor: '#E0E0E0',
                  borderRadius: 10,
                  marginTop: 15, // Adjusted margin
                  marginBottom: 10,
                }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>{truncateText(station.name, 30)}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>Distance: {station.distance}</Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: 'white',
                        padding: 10,
                        borderRadius: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 10
                      }}
                      onPress={(e) => {
                        e.stopPropagation(); // Prevent touch event propagation
                        openNavigation(station);
                      }}
                    >
                      <Text style={{ color: '#2c8de8', fontSize: 16, marginRight: 5 }}>Navigate</Text>

                    </TouchableOpacity>

                  </View>
                </View>

                {station.nearbyRestaurants && station.nearbyRestaurants.length > 0 && (
                  <FlatList
                    data={station.nearbyRestaurants}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    ListFooterComponent={<View style={{ width: 20 }} />}
                    renderItem={({ item: restaurantItem }) => (
                      <View style={{
                        padding: 10,
                        marginRight: 10, // Add margin to create space between cards
                        borderRadius: 10, // Rounded corners
                        borderWidth: 1,
                        borderColor: '#e0e0e0',
                        width: 200, // Set a fixed width for each card
                      }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                          {restaurantItem.name}
                        </Text>
                        <Text>Distance: {(parseFloat(restaurantItem.distance.split(' ')[0]) * 1000).toFixed(0)} meters</Text>

                        <TouchableOpacity
                          style={{
                            backgroundColor: '#2c8de8',
                            padding: 8,
                            borderRadius: 5,
                            marginTop: 5,
                          }}
                          onPress={(e) => {
                            e.stopPropagation(); // Prevent touch event propagation
                            openNavigation(restaurantItem);
                          }}
                        >
                          <Text style={{ color: 'white', textAlign: 'center' }}>
                            Navigate to Restaurant
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    keyExtractor={(restaurantItem, restaurantIndex) => `restaurant-${restaurantIndex}`}
                  />

                )}
              </TouchableOpacity>
            )}
            keyExtractor={(station, index) => `station-${index}`}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  modalButton: {
    backgroundColor: '#2c8de8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'lightgray', // Customize the cancel button color
  },
  cancelButtonText: {
    color: '#333', // Customize the cancel button text color
  },
});