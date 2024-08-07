import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { firestore } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const DateSummary = ({ route }) => {
  const { driverId, date } = route.params;
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShiftDetails = async () => {
      try {
        const q = query(
          collection(firestore, 'clockins'), // Ensure 'clockins' is your collection name
          where('userId', '==', driverId),
          where('timestamp', '>=', new Date(date)),
          where('timestamp', '<', new Date(new Date(date).setDate(new Date(date).getDate() + 1))) // For the specific day
        );

        const querySnapshot = await getDocs(q);
        let clockin = null;
        let clockout = null;
        let notes = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.type === 'clockin') {
            clockin = data.timestamp.toDate();
          } else if (data.type === 'clockout') {
            clockout = data.timestamp.toDate();
          }
          if (data.note) {
            notes.push(data.note);
          }
        });

        if (clockin && clockout) {
          const totalHours = ((clockout - clockin) / (1000 * 60 * 60)).toFixed(2);
          setSummaryData({
            startTime: clockin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: clockout.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            totalHours,
            notes: notes.join('; '),
          });
        } else {
          setSummaryData({
            startTime: 'N/A',
            endTime: 'N/A',
            totalHours: 0,
            notes: 'No complete shifts recorded.',
          });
        }
      } catch (error) {
        console.error('Error fetching shift details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShiftDetails();
  }, [driverId, date]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>Date: {date}</Text>
      <Text style={styles.text}>Start Time: {summaryData.startTime}</Text>
      <Text style={styles.text}>End Time: {summaryData.endTime}</Text>
      <Text style={styles.text}>Total Hours: {summaryData.totalHours}</Text>
      <Text style={styles.text}>Notes: {summaryData.notes}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
});

export default DateSummary;
