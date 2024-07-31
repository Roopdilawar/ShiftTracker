import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

const ClockOutConfirmation = ({ route, navigation }) => {
  const [note, setNote] = useState('');
  const { handleClockOut, clockInTime } = route.params;
  const [clockOutTime, setClockOutTime] = useState(null);
  const [shiftDuration, setShiftDuration] = useState(null);

  useEffect(() => {
    const currentTime = new Date();
    setClockOutTime(currentTime);
    const diff = currentTime - new Date(clockInTime);
    setShiftDuration((diff / (1000 * 60 * 60)).toFixed(2)); // Hours with 2 decimal places
  }, [clockInTime]);

  const confirmClockOut = () => {
    handleClockOut(note);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('./assets/ls_logo.jpeg')} style={styles.logo} />
        <Text style={styles.appName}>ShiftTracker</Text>
      </View>
      <View style={styles.content}>
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
        <TextInput
          placeholder="Add a note (optional)"
          value={note}
          onChangeText={setNote}
          style={styles.input}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={confirmClockOut}>
          <Text style={styles.buttonText}>Confirm Clock Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ClockOutConfirmation;
