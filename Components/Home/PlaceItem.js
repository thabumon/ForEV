import { View, Text } from 'react-native'
import React from 'react'

export default function PlaceItem({ place }) {
    console.log(place.geometry.location.lat);
    return (
        <View>
            <Text>{place.name}</Text>
        </View>
    )
}