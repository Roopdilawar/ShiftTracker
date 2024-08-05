// DriverCalendar.js
import React from 'react';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';

const DriverCalendar = ({ route, navigation }) => {
  const { driverId, driverName } = route.params;

  const handleDayPress = (day) => {
    navigation.navigate('DateSummary', { driverId, date: day.dateString });
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          // Example of marking a specific date
          '2024-08-15': { selected: true, marked: true },
        }}
      />
    </View>
  );
};

export default DriverCalendar;
