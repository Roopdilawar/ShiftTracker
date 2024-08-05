// DateSummary.js
import React from 'react';
import { View, Text } from 'react-native';

const DateSummary = ({ route }) => {
  const { driverId, date } = route.params;

  // Dummy data for demonstration
  const summaryData = {
    startTime: '08:00 AM',
    endTime: '05:00 PM',
    totalHours: 9,
    notes: 'Completed deliveries successfully.',
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Date: {date}</Text>
      <Text>Start Time: {summaryData.startTime}</Text>
      <Text>End Time: {summaryData.endTime}</Text>
      <Text>Total Hours: {summaryData.totalHours}</Text>
      <Text>Notes: {summaryData.notes}</Text>
    </View>
  );
};

export default DateSummary;
