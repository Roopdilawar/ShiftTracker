// NewDriver.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const NewDriver = ({ navigation, route }) => {
  const [name, setName] = useState('');

  const addDriver = () => {
    if (name.trim()) {
      route.params.addDriver({ id: Date.now().toString(), name });
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Driver Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Driver Name"
        value={name}
        onChangeText={setName}
      />
      <Button title="Add Driver" onPress={addDriver} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
  },
});

export default NewDriver;
