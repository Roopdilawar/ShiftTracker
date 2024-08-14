import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { firestore } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const DateSummary = ({ route, navigation }) => {
  const { driverId, date } = route.params;
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchShiftDetails = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(firestore, 'clockins'),
          where('userId', '==', driverId),
          where('timestamp', '>=', new Date(date)),
          where('timestamp', '<', new Date(new Date(date).setDate(new Date(date).getDate() + 1)))
        );

        const querySnapshot = await getDocs(q);
        const shiftData = [];
        let clockin = null;
        let entriesList = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.type === 'clockin') {
            clockin = data.timestamp.toDate();
          } else if (data.type === 'clockout') {
            const clockout = data.timestamp.toDate();
            const totalHours = ((clockout - clockin) / (1000 * 60 * 60)).toFixed(2);
            const notes = data.note || 'N/A';
            const fuel = data.fuel || 'N/A';
            entriesList = data.entries || [];

            shiftData.push({
              startTime: clockin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              endTime: clockout.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              totalHours,
              notes,
              fuel,
              entries: entriesList,
            });

            // Reset clockin and entriesList for the next shift
            clockin = null;
            entriesList = [];
          }
        });

        setShifts(shiftData);
      } catch (error) {
        console.error('Error fetching shift details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShiftDetails();
  }, [driverId, date]);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setModalVisible(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.appName}>ShiftTracker</Text>
        <Image source={require('./assets/ls_logo.png')} style={styles.logo} />
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.dateText}>{new Date(date).toLocaleDateString()}</Text>
        {shifts.length > 0 ? (
          shifts.map((shift, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.shiftTitle}>Shift {index + 1}</Text>
              <View style={styles.infoRow}>
                <MaterialIcons name="access-time" size={24} color="#555" />
                <Text style={styles.text}>Start Time: {shift.startTime}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="access-time" size={24} color="#555" />
                <Text style={styles.text}>End Time: {shift.endTime}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="timelapse" size={24} color="#555" />
                <Text style={styles.text}>Total Hours: {shift.totalHours}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="note" size={24} color="#555" />
                <Text style={styles.text}>Notes: {shift.notes}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="fuel" size={24} color="#555" /> 
                <Text style={styles.text}>Fuel Consumption: {shift.fuel}</Text>
              </View>
              {shift.entries.length > 0 && (
                <View>
                  <Text style={styles.sectionTitle}>Entries</Text>
                  {shift.entries.map((entry, entryIndex) => (
                    <View key={entryIndex} style={styles.entryRow}>
                      <Text style={styles.entryText}>Company: {entry.companyName}</Text>
                      <Text style={styles.entryText}>Hours: {entry.hours}</Text>
                      <Text style={styles.entryText}>Ticket #: {entry.ticketNumber}</Text>
                      {entry.image && (
                        <TouchableOpacity onPress={() => openImageModal(entry.image)}>
                          <Image
                            source={{ uri: entry.image }}
                            style={styles.entryImage}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      )}
                      {entry.note && (
                        <Text style={styles.entryText}>Note: {entry.note}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.card}>
            <Text style={styles.text}>No shifts recorded for this day.</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalBackground} onPress={closeImageModal}>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
  },
  dateText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#007AFF',
  },
  shiftTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginLeft: 10,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  entryRow: {
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  entryText: {
    fontSize: 15,
    color: '#555',
  },
  entryImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '90%',
  },
});

export default DateSummary;
