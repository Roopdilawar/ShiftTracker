import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { firestore } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons'; // Importing icons

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

  const handleDayPress = (day) => {
    console.log("Navigating to DateSummary for", day.dateString);
    navigation.navigate('DateSummary', { driverId, date: day.dateString });
  };

  // Prepare marked dates with hours worked and a dot marking
  const markedDates = Object.keys(hoursWorked).reduce((acc, date) => {
    acc[date] = {
      customStyles: {
        container: {
          backgroundColor: '#E0F7FA',
          borderRadius: 10,
        },
        text: {
          color: '#007AFF',
          fontWeight: 'bold',
        },
      },
      // Add a dot marker and the custom text for hours worked
      dots: [{ key: 'workHours', color: '#50cebb' }],
      customText: `${hoursWorked[date]}h`, // For showing hours worked
    };
    console.log(hoursWorked[date])
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.appName}>ShiftTracker</Text>
        <Image source={require('./assets/scorpion_logo.png')} style={styles.logo} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{driverName}'s Calendar</Text>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={markedDates}
          markingType={'multi-dot'} // Use multi-dot to show both marking and hours
          renderArrow={(direction) => (
            <Text style={styles.arrow}>{direction === 'left' ? '<' : '>'}</Text>
          )}
          theme={{
            'stylesheet.day.multiDot': {
              base: {
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
              },
              text: {
                marginTop: 4,
                fontSize: 16,
              },
              dot: {
                width: 6,
                height: 6,
                borderRadius: 3,
                marginTop: 1,
              },
              selectedDot: {
                backgroundColor: '#ffffff',
              },
              customText: {
                fontSize: 10,
                color: '#007AFF',
                marginTop: 2,
              },
            },
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    padding: 8,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  arrow: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default DriverCalendar;
