import { View, Text, Linking, Platform, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import PlaceItem from './PlaceItem';
import { TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import SwiperFlatList from 'react-native-swiper-flatlist';

export default function PlaceList({ placeList }) {
  const param = useRoute().params;

  const [place, setPlace] = useState([]);

  useEffect(() => {
    if (param && param.place) {
      setPlace(param.place);
    }
  }, [param]);

  const onDirectionClick = (place) => {

    console.log(place);

    const url = Platform.select({

        ios: "maps:" + place.geometry.location.lat + "," + place.geometry.location.lng + "?q=" + place.vicinity,

        android: "geo:" + place.geometry.location.lat + "," + place.geometry.location.lng + "?q=" + place.vicinity

    });

    Linking.openURL(url);

}

  const truncateText = (text, maxLength) => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength - 1) + '...';
    }

    return text;
  };

  if (!placeList || placeList.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No places found.</Text>
      </View>
    );
  }

  return (
    <SwiperFlatList
      index={0}
      paginationStyle={{ bottom: 10 }}
      style={styles.swiperContainer}
    >
      {placeList.map((place, index) => (
        <View key={index} style={styles.placeItemContainer}>
          <Text style={styles.placeName}>{truncateText(place.name, 25)}</Text>
          {place.distance !== undefined && (
            <Text style={styles.distance}>{place.distance.toFixed(2)} km</Text>
          )}
          <Text style={styles.address}>{truncateText(place.address, 40)}</Text>
          <TouchableOpacity
            style={styles.navigateButton}
           

onPress={() => onDirectionClick(place)}
          >
            <Text style={styles.buttonText}>Navigate</Text>
          </TouchableOpacity>
        </View>
      ))}
    </SwiperFlatList>
  );
}

const styles = StyleSheet.create({
  swiperContainer: {
    height: 500,
    marginBottom: 200,
  },
  placeItemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    marginHorizontal: 10,
    padding: 20,
    backgroundColor: 'white',
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  distance: {
    fontSize: 16,
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    marginBottom: 5,
    color: 'gray',
  },
  navigateButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
