import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView } from 'react-native';

const ClockOutConfirmation = ({ route, navigation }) => {
  const [note, setNote] = useState('');
  const { handleClockOut, clockInTime } = route.params;
  const [clockOutTime, setClockOutTime] = useState(null);
  const [shiftDuration, setShiftDuration] = useState(null);

  const [entries, setEntries] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [hours, setHours] = useState('');

  useEffect(() => {
    const currentTime = new Date();
    setClockOutTime(currentTime);
    const diff = currentTime - new Date(clockInTime);
    setShiftDuration((diff / (1000 * 60 * 60)).toFixed(2)); // Hours with 2 decimal places
  }, [clockInTime]);

  const confirmClockOut = () => {
    handleClockOut(note, entries); // Pass entries to handleClockOut
    navigation.goBack();
  };

  const addEntry = () => {
    if (companyName && ticketNumber && hours) {
      setEntries([...entries, { companyName, ticketNumber, hours }]);
      setCompanyName('');
      setTicketNumber('');
      setHours('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('./assets/scorpion_logo.png')} style={styles.logo} />
        <Text style={styles.appName}>ShiftTracker</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.topContent}>
          <Text style={styles.title}>Confirm Clock Out</Text>
          {clockInTime && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                Clock In Time: {new Date(clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.summaryText}>
                Clock Out Time: {clockOutTime && clockOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.summaryText}>Shift Duration: {shiftDuration} hours</Text>
            </View>
          )}
        </View>

        {/* Input Form Section */}
        <View style={styles.inputSection}>
          <TextInput
            placeholder="Company Name"
            value={companyName}
            onChangeText={setCompanyName}
            style={styles.input}
            placeholderTextColor="#aaa"
          />
          <TextInput
            placeholder="Ticket Number"
            value={ticketNumber}
            onChangeText={setTicketNumber}
            style={styles.input}
            placeholderTextColor="#aaa"
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Hours"
            value={hours}
            onChangeText={setHours}
            style={styles.input}
            placeholderTextColor="#aaa"
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.addButton} onPress={addEntry}>
            <Text style={styles.buttonText}>Add Entry</Text>
          </TouchableOpacity>
          <View style={styles.entriesContainer}>
            {entries.map((entry, index) => (
              <View key={index} style={styles.entry}>
                <Text style={styles.entryText}>Company: {entry.companyName}</Text>
                <Text style={styles.entryText}>Ticket #: {entry.ticketNumber}</Text>
                <Text style={styles.entryText}>Hours: {entry.hours}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomContent}>
          <TextInput
            placeholder="Add a note (optional)"
            value={note}
            onChangeText={setNote}
            style={styles.input}
            placeholderTextColor="#aaa"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={confirmClockOut}>
              <Text style={styles.buttonText}>Clock Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    padding: 20,
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
  topContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'center',
  },
  inputSection: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    backgroundColor: '#0288D1',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  entriesContainer: {
    width: '100%',
    marginTop: 20,
  },
  entry: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  entryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  bottomContent: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
});

export default ClockOutConfirmation;
