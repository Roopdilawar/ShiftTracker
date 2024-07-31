// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import * as Location from 'expo-location';
import { auth, firestore } from './firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

// San Francisco's coordinates and radius in km
const SF_CENTER = { latitude: 37.7749, longitude: -122.4194 };
const RADIUS = 50;

const HomeScreen = () => {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('Not Clocked In');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLon = toRad(coords2.longitude - coords1.longitude);
    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const isWithinSanFrancisco = (location) => {
    const distance = haversineDistance(
      { latitude: location.coords.latitude, longitude: location.coords.longitude },
      SF_CENTER
    );
    return distance <= RADIUS;
  };

  const handleClockIn = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user && location) {
      if (isWithinSanFrancisco(location)) {
        try {
          await addDoc(collection(firestore, 'clockins'), {
            userId: user.uid,
            type: 'clockin',
            location: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            },
            timestamp: serverTimestamp()
          });
          setStatus('Clocked In');
        } catch (error) {
          Alert.alert('Error', 'Failed to clock in');
          console.error('Clock in error:', error);
        }
      } else {
        Alert.alert('Error', 'You must be within San Francisco to clock in');
      }
    }
    setLoading(false);
  };

  const handleClockOut = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user && location) {
      if (isWithinSanFrancisco(location)) {
        try {
          await addDoc(collection(firestore, 'clockins'), {
            userId: user.uid,
            type: 'clockout',
            location: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            },
            timestamp: serverTimestamp()
          });
          setStatus('Clocked Out');
        } catch (error) {
          Alert.alert('Error', 'Failed to clock out');
          console.error('Clock out error:', error);
        }
      } else {
        Alert.alert('Error', 'You must be within San Francisco to clock out');
      }
    }
    setLoading(false);
  };

  return (
    <View>
      <Text>Status: {status}</Text>
      <Button title="Clock In" onPress={handleClockIn} disabled={loading} />
      <Button title="Clock Out" onPress={handleClockOut} disabled={loading} />
    </View>
  );
};

export default HomeScreen;
