import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { firestore } from './firebase'; // Ensure this path matches your project structure
import { MaterialIcons } from '@expo/vector-icons';

const MapViewComponent = ({ navigation }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationQuery = query(collection(firestore, 'liveLocations'));
        const locationSnapshot = await getDocs(locationQuery);
        const locationData = locationSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch user data
        const usersSnapshot = await getDocs(collection(firestore, 'users'));
        const usersData = usersSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().fullName || 'Unknown';
          return acc;
        }, {});

        // Fetch the latest clock-in time for each driver
        for (const location of locationData) {
          const clockInQuery = query(
            collection(firestore, 'clockins'),
            where('userId', '==', location.id),
            where('type', '==', 'clockin'),
            orderBy('timestamp', 'desc'),
            limit(1)
          );

          const clockInSnapshot = await getDocs(clockInQuery);
          if (!clockInSnapshot.empty) {
            const lastClockIn = clockInSnapshot.docs[0].data().timestamp.toDate();
            location.lastClockInTime = lastClockIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else {
            location.lastClockInTime = 'Unknown';
          }
        }

        // Map locations to include user full name
        const mappedLocations = locationData.map((loc) => ({
          ...loc,
          fullName: usersData[loc.id] || 'Unknown',
        }));

        setLocations(mappedLocations);
      } catch (error) {
        console.error('Error fetching location data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
    const interval = setInterval(fetchLocations, 10000); // Fetch every 10 seconds

    return () => clearInterval(interval); // Clear interval on unmount
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.appName}>ShiftTracker</Text>
        <Image source={require('./assets/scorpion_logo.png')} style={styles.logo} />
      </View>
      <MapView style={styles.map} initialRegion={{
          latitude: 53.5461, 
          longitude: -113.4938, 
          latitudeDelta: 0.0922, 
          longitudeDelta: 0.0421 
      }}>
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.fullName}
            description={`Started at ${loc.lastClockInTime}`}
          >
            <View style={styles.marker}>
              <Text style={styles.markerText}>
                {loc.fullName.split(' ').map((n) => n[0]).join('')}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>
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
  map: {
    flex: 1,
  },
  marker: {
    backgroundColor: '#007AFF',
    padding: 5,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default MapViewComponent;
