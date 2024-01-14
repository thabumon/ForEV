import { View, Text, Image } from 'react-native'
import React from 'react'
import MapView, { Marker } from 'react-native-maps'

export default function PlaceMarker({ item }) {
    return (
        <Marker
            title={item.name}
            coordinate={
                {
                    latitude: item.geometry.location.lat,
                    longitude: item.geometry.location.lng,
                    latitudeDelta: 0.0422,
                    longitudeDelta: 0.0421,

                }
            } >
            <Image
                source={require('../assets/icons/ev-icon.png')} // Replace with your custom marker image
                style={{ width: 40, height: 40 }} />

        </Marker>

    )
}