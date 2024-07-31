// ClockOutConfirmation.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

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
      <Text style={styles.title}>Confirm Clock Out</Text>
      {clockInTime && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>Clock In Time: {new Date(clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          <Text style={styles.summaryText}>Clock Out Time: {clockOutTime && clockOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
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
