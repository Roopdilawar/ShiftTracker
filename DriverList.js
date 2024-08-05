// DriverList.js
import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

const drivers = [
  { id: '1', name: 'Driver 1' },
  { id: '2', name: 'Driver 2' },
  { id: '3', name: 'Driver 3' },
];

const DriverList = ({ navigation }) => {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ padding: 20, borderBottomWidth: 1, borderColor: '#ccc' }}
            onPress={() => navigation.navigate('DriverCalendar', { driverId: item.id, driverName: item.name })}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default DriverList;
