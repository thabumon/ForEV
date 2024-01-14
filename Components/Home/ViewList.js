// ViewList.js
import React from 'react';
import { View, Text, Button, FlatList } from 'react-native';

const ViewList = ({ placeList, openNavigation }) => {
  return (
    <View>
      <Text>Places Nearby: {placeList.length}</Text>
      <FlatList
        data={placeList}
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <Text>Name: {item.name}</Text>
            <Text>Distance: {item.distance}</Text>
            <Button
              title="Navigate"
              onPress={() => {
                openNavigation(item);
              }}
            />
          </View>
        )}
        keyExtractor={(item) => item.place_id}
      />
    </View>
  );
};

export default ViewList;
