import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AppNavigation from './navigation/appNavigation';
import React, { useState, useEffect } from 'react';
// import { Platform, Text, View, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { UserLocationContext } from './Components/Context/UserLocationContext';

export default function App() {

  const [location, setLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      console.log('loc', location);
    })();
  }, []);
  // const [Location, setLocation] = useState(null);
  // const [errorMsg, setErrorMsg] = useState(null);
  // useEffect(() => {
  //   (async () => {

  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       setErrorMsg('Permission to access location was denied');
  //       return;
  //     }

  //     let location = await Location.getCurrentPositionAsync({});
  //     setLocation(location);
  //     console.log('location', location);
  //   })();
  // }, []);


  return (
    <UserLocationContext.Provider
      value={{ location, setLocation }}>
      <AppNavigation />
    </UserLocationContext.Provider>
  );
}
