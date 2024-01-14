import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { UserLocationContext } from '../Components/Context/UserLocationContext';
import PlaceMarker from './PlaceMarker';
import MapViewDirections from 'react-native-maps-directions';

export default function GoogleMapView({ placeList, selectedDestination, customLocation }) {
    const { location } = useContext(UserLocationContext);
    const [mapRegion, setMapRegion] = useState({});

    useEffect(() => {
        if (selectedDestination && (location || customLocation)) {
            const originLatitude = customLocation ? customLocation.geometry.location.lat : location.coords.latitude;
            const originLongitude = customLocation ? customLocation.geometry.location.lng : location.coords.longitude;
            const destLatitude = selectedDestination.geometry.location.lat;
            const destLongitude = selectedDestination.geometry.location.lng;

            if (!isNaN(originLatitude) && !isNaN(originLongitude) && !isNaN(destLatitude) && !isNaN(destLongitude)) {
                const midLatitude = (originLatitude + destLatitude) / 2;
                const midLongitude = (originLongitude + destLongitude) / 2;

                const latitudeDelta = Math.abs(originLatitude - destLatitude) * 2;
                const longitudeDelta = Math.abs(originLongitude - destLongitude) * 2;

                setMapRegion({
                    latitude: midLatitude,
                    longitude: midLongitude,
                    latitudeDelta: latitudeDelta + 0.05,
                    longitudeDelta: longitudeDelta + 0.05,
                });
            }
        }
    }, [location, customLocation, selectedDestination]);

    return (
        <View style={styles.container}>
            {/* Add a 
             prop to force re-render of the map */}
            <MapView
                key={selectedDestination ? selectedDestination.id : 'default'}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                showsUserLocation={true}
                region={mapRegion}

            >

                {placeList.map((item, index) => index <= 5 && (
                    <PlaceMarker item={item} key={index} />

                ))}
                {/* Display the selected destination marker */}

                {customLocation && (

                    <Marker
                        coordinate={{
                            latitude: customLocation.geometry.location.lat,
                            longitude: customLocation.geometry.location.lng,
                        }}
                        title={customLocation.name}
                        pinColor="blue"
                    />
                )}

                {selectedDestination && (

                    <Marker
                        coordinate={{
                            latitude: selectedDestination.geometry.location.lat,
                            longitude: selectedDestination.geometry.location.lng,
                        }}
                        title={selectedDestination.name}
                        pinColor="green"
                    />
                )}

                {/* Render direction polyline if a destination is selected */}
                {selectedDestination && location && (
                    <MapViewDirections
                        apikey='AIzaSyDCtC15ypeYqwvjn43ZVKkPsvQfPx9_BJc'
                        origin={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        destination={{
                            latitude: selectedDestination.geometry.location.lat,
                            longitude: selectedDestination.geometry.location.lng,
                        }}
                        strokeWidth={3}
                        strokeColor="green"
                    />
                )}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    map: {
        flex: 1
    },
});
