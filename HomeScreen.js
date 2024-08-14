import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { auth, firestore } from './firebase';
import { addDoc, collection, serverTimestamp, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons'; // Import icons

// Edmonton's coordinates and radius in km
const EDMONTON_CENTER = { latitude: 53.5461, longitude: -113.4938 };
const RADIUS = 20;

// Define the background task
const LOCATION_TASK_NAME = 'background-location-task';

// Function to send location to Firebase
const sendLocationToFirebase = async (latitude, longitude) => {
  const user = auth.currentUser;
  if (!user) {
    console.log('No authenticated user');
    return;
  }

  try {
    const locationDocRef = doc(firestore, 'liveLocations', user.uid);
    await setDoc(locationDocRef, { latitude, longitude, timestamp: new Date() }, { merge: true });
    console.log('Location updated:', latitude, longitude);
  } catch (error) {
    console.error('Error sending location to Firebase:', error);
  }
};

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  console.log('here')
  if (error) {
    console.error('Task Manager Error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    console.log('Received new locations:', locations);
    locations.forEach((location) => {
      const { latitude, longitude } = location.coords;
      sendLocationToFirebase(latitude, longitude);
    });
  }
});

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading', 'clockedIn', 'clockedOut'
  const [loading, setLoading] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);

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

    checkClockStatus();

    const interval = setInterval(() => {
      checkClockStatus();
    }, 60000); // Update status every minute

    return () => clearInterval(interval); // Cleanup interval on component unmount
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

  const isWithinEdmonton = (location) => {
    const distance = haversineDistance(
      { latitude: location.coords.latitude, longitude: location.coords.longitude },
      EDMONTON_CENTER
    );
    // return distance <= RADIUS;
    return true;
  };

  const checkClockStatus = async () => {
    console.log('Checking clock status...');
    const user = auth.currentUser;
    if (user) {
      console.log('User is authenticated:', user.uid);
      const q = query(
        collection(firestore, 'clockins'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const lastEntry = querySnapshot.docs[0].data();
          console.log('Last entry:', lastEntry);
          if (lastEntry.type === 'clockin') {
            setStatus('clockedIn');
            setClockInTime(lastEntry.timestamp.toDate());
            console.log('User is clocked in');
            startSharingLocation(); // Ensure location sharing is active if clocked in
          } else {
            setStatus('clockedOut');
            stopSharingLocation(); // Stop sharing location if clocked out
            console.log('User is clocked out');
          }
        } else {
          setStatus('clockedOut');
          console.log('No previous entries found, setting status to clocked out');
        }
      } catch (error) {
        console.error('Error fetching clock status:', error);
      }
    } else {
      setStatus('clockedOut');
      console.log('No authenticated user, setting status to clocked out');
    }
  };

  const startSharingLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }

    const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus.status !== 'granted') {
      Alert.alert('Permission to access location in the background was denied');
      return;
    }

    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.log(hasStarted)
    if (!hasStarted) {
      console.log('Starting location updates...');
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // 10 seconds
        distanceInterval: 50, // 10 meters
        showsBackgroundLocationIndicator: true, // Show the location indicator on iOS
        foregroundService: {
          notificationTitle: 'ShiftTracker Location Service',
          notificationBody: 'We are using your location to show your current position.',
        },
      });
    } else {
      console.log('Location updates already started');
    }
  };

  const stopSharingLocation = async () => {
    console.log('Stopping location updates...');
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

    const user = auth.currentUser;
    if (user) {
      try {
        const locationDocRef = doc(firestore, 'liveLocations', user.uid);
        await deleteDoc(locationDocRef);
        console.log('Location entry deleted from Firestore');
      } catch (error) {
        console.error('Error deleting location from Firestore:', error);
      }
    }
  };


  const handleClockIn = async (note) => {
    setLoading(true);
    const user = auth.currentUser;
    if (user && location) {
      if (isWithinEdmonton(location)) {
        try {
          const docRef = await addDoc(collection(firestore, 'clockins'), {
            userId: user.uid,
            type: 'clockin',
            location: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            },
            timestamp: serverTimestamp(),
            note: note || ''
          });
          const docSnapshot = await getDoc(doc(firestore, 'clockins', docRef.id));
          setStatus('clockedIn');
          setClockInTime(docSnapshot.data().timestamp.toDate());
          startSharingLocation(); // Start sharing location on clock in
        } catch (error) {
          Alert.alert('Error', 'Failed to clock in');
          console.error('Clock in error:', error);
        }
      } else {
        Alert.alert('Error', 'You must be within Edmonton to clock in');
      }
    }
    setLoading(false);
  };

  const handleClockOut = async (note, fuel, entries) => {
    setLoading(true);
    const user = auth.currentUser;
    if (user && location) {
      if (isWithinEdmonton(location)) {
        try {
          await addDoc(collection(firestore, 'clockins'), {
            userId: user.uid,
            type: 'clockout',
            location: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            },
            timestamp: serverTimestamp(),
            note: note || '',
            fuel: fuel || 0,
            entries: entries || [], // Add entries to the document
          });
          setStatus('clockedOut');
          stopSharingLocation(); // Stop sharing location on clock out
        } catch (error) {
          Alert.alert('Error', 'Failed to clock out');
          console.error('Clock out error:', error);
        }
      } else {
        Alert.alert('Error', 'You must be within Edmonton to clock out');
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const calculateHoursSinceClockIn = () => {
    if (!clockInTime) return 0;
    const now = new Date();
    const diff = now - clockInTime;
    return (diff / (1000 * 60 * 60)).toFixed(2); // Hours with 2 decimal places
  };

  if (status === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require('./assets/ls_logo.png')} style={styles.logo} />
          <Text style={styles.appName}>ShiftTracker</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.statusContainer}>
            {status === 'clockedIn' ? (
              <>
                <MaterialIcons name="access-time" size={48} color="green" />
                <Text style={styles.statusText}>Clocked In</Text>
                <Text style={styles.hoursText}>{calculateHoursSinceClockIn()} hours since clocking in</Text>
              </>
            ) : (
              <>
                <MaterialIcons name="access-time" size={48} color="red" />
                <Text style={styles.statusText}>Not Clocked In</Text>
              </>
            )}
          </View>
          {status === 'clockedOut' && (
            <TouchableOpacity
              style={[styles.button, styles.clockInButton]}
              onPress={() => navigation.navigate('ClockInConfirmation', { handleClockIn })}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Clock In</Text>
            </TouchableOpacity>
          )}
          {status === 'clockedIn' && (
            <TouchableOpacity
              style={[styles.button, styles.clockOutButton]}
              onPress={() => navigation.navigate('ClockOutConfirmation', { handleClockOut, clockInTime })}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Clock Out</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0288D1',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  hoursText: {
    fontSize: 16,
    marginTop: 5,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
  },
  clockInButton: {
    backgroundColor: '#4CAF50',
  },
  clockOutButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#0288D1',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;
