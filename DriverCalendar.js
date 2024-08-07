import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { firestore } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const DriverCalendar = ({ route, navigation }) => {
  const { driverId, driverName } = route.params;
  const [hoursWorked, setHoursWorked] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkHours = async () => {
      try {
        const q = query(
          collection(firestore, 'clockins'), // Ensure 'clockins' is your collection name
          where('userId', '==', driverId)
        );

        const querySnapshot = await getDocs(q);
        const workEntries = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          workEntries.push({
            type: data.type,
            timestamp: data.timestamp.toDate(), // Convert Firestore timestamp to JS Date
          });
        });

        // Calculate hours worked per day
        const hoursPerDay = {};

        workEntries.forEach((entry) => {
          const dateString = entry.timestamp.toISOString().split('T')[0]; // Extract date string in YYYY-MM-DD format

          if (!hoursPerDay[dateString]) {
            hoursPerDay[dateString] = { clockin: null, clockout: null };
          }

          if (entry.type === 'clockin') {
            hoursPerDay[dateString].clockin = entry.timestamp;
          } else if (entry.type === 'clockout') {
            hoursPerDay[dateString].clockout = entry.timestamp;
          }
        });

        const calculatedHours = {};

        for (const date in hoursPerDay) {
          const { clockin, clockout } = hoursPerDay[date];
          if (clockin && clockout) {
            const hours = (clockout - clockin) / (1000 * 60 * 60); // Convert milliseconds to hours
            calculatedHours[date] = hours.toFixed(2); // Store hours worked
          }
        }

        setHoursWorked(calculatedHours);
        console.log(calculatedHours);
      } catch (error) {
        console.error('Error fetching work hours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkHours();
  }, [driverId]);

  const renderDay = (day) => (
    <View style={styles.dayContainer}>
      <Text style={styles.dateText}>{day.day}</Text>
      {hoursWorked[day.dateString] && (
        <Text style={styles.hoursText}>{hoursWorked[day.dateString]}h</Text>
      )}
    </View>
  );

  const handleDayPress = (day) => {
    console.log("Navigating")
    navigation.navigate('DateSummary', { driverId, date: day.dateString });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{driverName}'s Calendar</Text>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={Object.keys(hoursWorked).reduce((acc, date) => {
          acc[date] = {
            selected: true,
            marked: true,
            customStyles: {
              container: {
                backgroundColor: '#E0F7FA',
              },
              text: {
                color: '#007AFF',
              },
            },
          };
          return acc;
        }, {})}
        markingType={'custom'}
        dayComponent={({ date }) => renderDay(date)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 4, // Adds space between the date text and hours text
  },
  dateText: {
    fontSize: 14,
    color: '#000',
  },
  hoursText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2, // Adds space between the date and hours text
  },
});

export default DriverCalendar;
